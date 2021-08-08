import http from 'k6/http';
import { sleep } from 'k6';

export let options = {
  vus: 20,
  duration: '20s',
};

export default function () {
  let url = 'http://localhost:3000/qa/answers/6400000/report';

  http.put(url);
  // sleep(1);
}