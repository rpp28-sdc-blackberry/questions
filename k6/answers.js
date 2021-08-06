import http from 'k6/http';
import { sleep } from 'k6';

export let options = {
  vus: 5,
  duration: '30s',
  // iterations: 1,
  // scenarios: {
  //   constant_request_rate: {
  //     executor: 'constant-arrival-rate',
  //     rate: 1000,
  //     timeUnit: '1s', // 1000 iterations per second, i.e. 1000 RPS
  //     duration: '600s',
  //     preAllocatedVUs: 10000, // how large the initial pool of VUs would be
  //     maxVUs: 50000, // if the preAllocatedVUs are not enough, we can initialize more
  //   },
  // },
};

export default function () {
  http.get('http://localhost:3000/qa/questions/3200211/answers');
  // sleep(1);
}