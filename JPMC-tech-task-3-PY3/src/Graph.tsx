import React, { Component } from 'react';
import { Table } from '@jpmorganchase/perspective';
import { ServerRespond } from './DataStreamer';
import { DataManipulator } from './DataManipulator';
import './Graph.css';

interface IProps {
  data: ServerRespond[],
}

interface PerspectiveViewerElement extends HTMLElement {
  load: (table: Table) => void,
}
class Graph extends Component<IProps, {}> {
  table: Table | undefined;

  render() {
    return React.createElement('perspective-viewer');
  }

  componentDidMount() {
    // Get element from the DOM.
    const elem = document.getElementsByTagName('perspective-viewer')[0] as unknown as PerspectiveViewerElement;

    const schema = {
   	  price_abc: 'float',
   	  price_def: 'float',
   	  ratio: 'float',
      timestamp: 'date',
      upper_bound: 'float',
      lower_bound: 'float',
      trigger_alert: 'float',
    };

    if (window.perspective && window.perspective.worker()) {
      this.table = window.perspective.worker().table(schema);
    }
    if (this.table) {
      // Load the `table` in the `<perspective-viewer>` DOM reference.
      elem.load(this.table);
// ● view’ is the the kind of graph we wanted to visualize the data as. Initially, this is
// already set to y_line. This is the type of graph we want so we’re good here.
// ● ‘column-pivots’ used to exist and was what allowed us to distinguish / split
// stock ABC with DEF back in task 2. We removed this because we’re concerned
// about the ratios between two stocks and not their separate prices
// ● ‘row-pivots’ takes care of our x-axis. This allows us to map each datapoint
// based on the timestamp it has. Without this, the x-axis is blank. So this field
// and its value remains
// ● ‘columns’ is what will allow us to only focus on a particular part of a datapoint’s
// data along the y-axis. Without this, the graph will plot all the fields and values of
// each datapoint and it will be a lot of noise. For this case, we want to track ratio,
// lower_bound, upper_bound and trigger_alert.
// ● ‘aggregates’ is what will allow us to handle the cases of duplicated data we
// observed way back in task 2 and consolidate them as just one data point. In
// our case we only want to consider a data point unique if it has a timestamp.
// Otherwise, we will average out the all the values of the other non-unique fields
// these ‘similar’ datapoints before treating them as one (e.g. ratio, price_abc, …)
      elem.setAttribute('view', 'y_line');
      elem.setAttribute('row-pivots', '["timestamp"]');
      elem.setAttribute('columns', '["ratio","lower_bound","upper_bound","trigger_alert"]');
      elem.setAttribute('aggregates', JSON.stringify({
        price_abc: 'avg',
        price_def: 'avg',
        ratio: 'avg',
        timestamp: 'distinct count',
        upper_bound: 'avg',
        lower_bound: 'avg',
        trigger_alert: 'avg',
      }));
    }
  }

  componentDidUpdate() {
    if (this.table) {
      this.table.update([
        DataManipulator.generateRow(this.props.data),
      ]);
    }
  }
}

export default Graph;
