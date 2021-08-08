import http from 'k6/http';
import { sleep } from 'k6';

export let options = {
  vus: 300,
  duration: '10s',
};

export default function () {
  let url = 'http://localhost:3000/qa/questions/3200000/helpful';

  http.put(url);
  // sleep(1);
}