import http from 'k6/http';
import { sleep } from 'k6';

export let options = {
  vus:10,
  duration: '30s',
  // iterations: 1,
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
};

export default function () {
  http.get('http://localhost:3000/qa/questions?product_id=1');
  // sleep(1);
}