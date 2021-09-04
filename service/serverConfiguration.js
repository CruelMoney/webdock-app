import {api_url} from '../config/config';

export async function getImages(api_key) {
  try {
    let request = await fetch(api_url + 'images', {
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
export async function getLocations(api_key) {
  try {
    let request = await fetch(api_url + 'locations', {
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
export async function getProfiles(api_key, lcid) {
  try {
    let request = await fetch(api_url + 'profiles?locationId=' + lcid, {
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
