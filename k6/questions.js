import http from 'k6/http';
import { sleep } from 'k6';

export let options = {
  vus: 1,
  duration: '10s',
  // iterations: 1,
  // thresholds: {
  //   // 90% of requests must finish within 400ms.
  //   http_req_duration: ['p(90) < 3000'],
  // },
};

export default function () {
  http.get('http://localhost:3000/qa/questions?product_id=100000&count=1');
  // sleep(1);
}