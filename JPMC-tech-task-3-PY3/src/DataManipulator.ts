// This file will be responsible for processing the raw
// stock data we’ve received from the server before it throws it back to the Graph
// component’s table to render.
import { ServerRespond } from './DataStreamer';

// we have to modify in this file is the Row interface. If you notice,
// the initial setting of the Row interface is almost the same as the old schema in
// Graph.tsx before we updated it. So now, we have to update it to match the
// new schema.
export interface Row {
  price_abc: number,
  price_def: number,
  ratio: number,
  timestamp: Date,
  upper_bound: number,
  lower_bound: number,
  trigger_alert: number | undefined,
}

// Here we can compute for price_abc and price_def properly (like what you did
//   back in task 1). Afterwards we can also compute for ratio using the two
//   computed prices, (like what you did in task 1 too). And, set lower and upper
//   bounds, as well as trigger_alert. To better understand this see the expected
//   change in the next slide
export class DataManipulator {
  static generateRow(serverResponds: ServerRespond[]): Row[] {
  	const priceABC = (serverRespond[0].top_ask.price + serverRespond[0].top_bid.price)/2;
  	const priceDEF = (serverRespond[1].top_ask.price + serverRespond[1].top_bid.price)/2;
  	const ratio = priceABC / priceDEF;
  	const upperBound = 1 + 0.05;
  	const lowerBound = 1 - 0.05;
    return {
    	price_abc: priceABC,
    	price_def: priceDEF,
    	ratio,
    	timestamp: serverRespond[0].timestamp > serverRespond[1].timestamp ? serverRespond[0].timestamp : serverRespond[1].timestamp,
    	upper_bound:upperBound,
    	lower_bound:lowerBound,
        trigger_alert: (ratio > upperbound || ratio < lowerBound) ? ratio : undefined,
      };
      
  }
}
