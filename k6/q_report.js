import http from 'k6/http';
import { sleep } from 'k6';

export let options = {
  vus: 200,
  duration: '10s',
  // iterations: 1,
};

export default function () {
  let url = 'http://localhost:3000/qa/questions/3200000/report';

  http.put(url);
  // sleep(1);
}