import {api_url} from '../config/config';

export async function getMetrics(api_key, slug) {
  try {
    let request = await fetch(api_url + 'servers/' + slug + '/metrics', {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + api_key,
      },
    });
    let result = await request.json();

    request = null;
    return result;
  } catch (error) {
    console.log('Api call error');
    alert(error.message);
  }
}
export async function getInstantMetrics(api_key, slug) {
  try {
    let request = await fetch(api_url + 'servers/' + slug + '/metrics/now', {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + api_key,
      },
    });
    let result = await request.json();

    request = null;
    return result;
  } catch (error) {
    console.log('Api call error');
    alert(error.message);
  }
}

