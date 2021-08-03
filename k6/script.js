import http from 'k6/http';
import { sleep } from 'k6';

export let options = {
  vus: 1,
  duration: '1m',
  // iterations: 1,
  // thresholds: {
  //   // 90% of requests must finish within 400ms.
  //   http_req_duration: ['p(90) < 3000'],
  // },
};

export default function () {
  http.get('http://localhost:3000/qa/questions/11/answers');
  sleep(1);
}
