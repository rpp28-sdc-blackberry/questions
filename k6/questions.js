import http from 'k6/http';
import { sleep } from 'k6';

export let options = {
  vus: 5,
  duration: '30s',
  // rps: 1000,
  // iterations: 10000,
  // setupTimeout: '1s',
  // teardownTimeout: '1s',
  // scenarios: {
  //   constant_request_rate: {
  //     executor: 'constant-arrival-rate',
  //     rate: 2000,
  //     timeUnit: '1s', // 2000 iterations per second, i.e. 1000 RPS
  //     duration: '300s',
  //     preAllocatedVUs: 1000, // how large the initial pool of VUs would be
  //     maxVUs: 10000, // if the preAllocatedVUs are not enough, we can initialize more
  //   },
  // },
  // stages: [
  //   { duration: '1m', target: 100 }, // below normal load
  //   { duration: '1m', target: 200 }, // normal load
  //   { duration: '1m', target: 300 }, // around the breaking point
  //   { duration: '1m', target: 400 }, // beyond the breaking point
  //   { duration: '1m', target: 400 },
  //   { duration: '1m', target: 0 }, // scale down. Recovery stage.
  // ],
};

export default function () {
  http.get('http://localhost:3000/qa/questions?product_id=990000');
  // sleep(1);
}