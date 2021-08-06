import http from 'k6/http';
import { sleep } from 'k6';

export let options = {
  vus: 1000,
  duration: '30s',
  // scenarios: {
  //   constant_request_rate: {
  //     executor: 'constant-arrival-rate',
  //     rate: 1000,
  //     timeUnit: '1s', // 1000 iterations per second, i.e. 1000 RPS
  //     duration: '30s',
  //     preAllocatedVUs: 1000, // how large the initial pool of VUs would be
  //     maxVUs: 10000, // if the preAllocatedVUs are not enough, we can initialize more
  //   },
  // },
};

export default function () {
  let url = 'http://localhost:3000/qa/questions/3200000/answers';
  let payload = {
    name: 'A3',
    body: 'A3',
    email: 'a3@g.com',
    photos: ['photo5']
  }

  let params = {
    headers: {
      'Content-Type': 'application/json'
    }
  }
  http.post(url, JSON.stringify(payload), params);
  // sleep(1);
}