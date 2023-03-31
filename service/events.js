import {api_url} from '../config/config';

export async function getEvents(api_key, page) {
  try {
    let request = await fetch(api_url + 'events?per_page=20&page=' + page, {
      method: 'GET',
      headers: {
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
export async function getEventsPerPage(api_key, perpage) {
  try {
    let request = await fetch(api_url + 'events?per_page=' + perpage, {
      method: 'GET',
      headers: {
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
export async function getEventsByCallbackId(api_key, callbackId) {
  try {
    let request = await fetch(
      api_url + 'events?callbackId=' + callbackId + '&per_page=9999999',
      {
        method: 'GET',
        headers: {
          Authorization: 'Bearer ' + api_key,
        },
      },
    );
    let result = await request.json();
    request = null;
    return result;
  } catch (error) {
    console.log('Api call error');
    alert(error.message);
  }
}
export async function getAllEvents(api_key) {
  try {
    let request = await fetch(api_url + 'events?per_page=999999', {
      method: 'GET',
      headers: {
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
export async function getAllEventsBySlug(api_key, slug) {
  try {
    let request = await fetch(api_url + 'events?per_page=999999', {
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + api_key,
      },
    });
    let result = await request.json();
    result = result.filter(obj => {
      return obj.serverSlug === slug;
    });
    request = null;
    return result;
  } catch (error) {
    console.log('Api call error');
    alert(error.message);
  }
}
