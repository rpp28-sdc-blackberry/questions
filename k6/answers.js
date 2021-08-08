import http from 'k6/http';
import { sleep } from 'k6';

export let options = {
  vus: 5,
  duration: '30s',
};

export default function () {
  http.get('http://localhost:3000/qa/questions/3200211/answers');
  // sleep(1);
}