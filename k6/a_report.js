import http from 'k6/http';
import { sleep } from 'k6';

export let options = {
  vus: 20,
  duration: '20s',
  // iterations: 1,
  // thresholds: {
  //   // 90% of requests must finish within 400ms.
  //   http_req_duration: ['p(90) < 3000'],
  // },
};

export default function () {
  let url = 'http://localhost:3000/qa/answers/6400000/report';

  http.put(url);
  // sleep(1);
}