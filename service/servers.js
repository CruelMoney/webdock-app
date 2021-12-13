import {api_url} from '../config/config';

export async function getServers(api_key) {
  try {
    let request = await fetch(api_url + 'servers?status=active', {
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + api_key,
        "X-Application": "Webdock Mobile App v2.00"
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
export async function getServerBySlug(api_key, slug) {
  try {
    let request = await fetch(api_url + 'servers/' + slug, {
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

export async function updateServerMetadata(
  api_key,
  slug,
  name,
  description,
  notes,
  nextActionDate,
) {
  try {
    let request = await fetch(api_url + 'servers/' + slug, {
      method: 'PATCH',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + api_key,
      },
      body: JSON.stringify({
        name: name,
        description: description,
        notes: notes,
        nextActionDate: nextActionDate,
      }),
    });
    let result = {status: await request.status, response: await request.json()};
    request = null;
    return result;
  } catch (error) {
    console.log('Api call error');
    alert(error.message);
  }
}
export async function provisionAServer(api_key, name,slug,locationId,profileSlug,imageSlug,snapshotId) {
  try {
    let request = await fetch(
      api_url + 'servers',
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + api_key,
        },
        body: JSON.stringify({
          name:name,
          slug:slug,
          locationId:locationId,
          profileSlug:profileSlug,
          imageSlug:imageSlug,
          snapshotId:snapshotId
        }),
      },
    );
    let result = {status: request.status, response: await request.json()};
    request = null;
    return result;
  } catch (error) {
    console.log('Api call error');
    alert(error.message);
  }
}

