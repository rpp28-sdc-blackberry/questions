import http from 'k6/http';
import { sleep } from 'k6';

export let options = {
  vus: 1000,
  duration: '30s',
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