import http from 'k6/http';
import { sleep } from 'k6';

export let options = {
  vus: 500,
  duration: '10s',
  // iterations: 1,
};

export default function () {
  let url = 'http://localhost:3000/qa/questions';
  let payload = {
    name: 'Q4',
    body: 'Q4',
    email: 'q4@g.com',
    product_id: 1000000
  }

  let params = {
    headers: {
      'Content-Type': 'application/json'
    }
  }
  http.post(url, JSON.stringify(payload), params);
  // sleep(1);
}