import FastImage from 'react-native-fast-image';
import {api_url} from '../config/config';
import {serverIconResponseCache} from './serverIconCache';

export async function getServers(api_key) {
  try {
    let request = await fetch(api_url + 'servers?status=active', {
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + api_key,
        'X-Application': 'Webdock Mobile App v2.00',
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
export async function provisionAServer(
  api_key,
  name,
  slug,
  locationId,
  profileSlug,
  imageSlug,
  snapshotId,
) {
  try {
    let request = await fetch(api_url + 'servers', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + api_key,
      },
      body: JSON.stringify({
        name: name,
        slug: slug,
        locationId: locationId,
        profileSlug: profileSlug,
        imageSlug: imageSlug,
      }),
    });
    let result = {status: request.status, response: await request.json()};
    request = null;
    return result;
  } catch (error) {
    console.log('Api call error');
    alert(error.message);
  }
}
export async function getServerSlugStatus(name) {
  try {
    let request = await fetch(
      'https://webdock.io/tools/getServerSlug?name=' + name,
      {
        method: 'GET',
        headers: {
          'X-Application': 'Webdock Mobile App v2.00',
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
export async function getServerIcon(slug) {
  try {
    let request = await fetch(
      'https://webdock.io/en/app_data/getServerIcon?slug=' +
        slug +
        '&secret=bf34eaa48c2643bb9bec16e8f46d88d8',
      {
        method: 'GET',
        headers: {
          'X-Application': 'Webdock Mobile App v2.00',
        },
      },
    );
    let result = await request.json();
    console.log();
    request = null;
    return result;
  } catch (error) {
    console.log('Api call error');
    alert(error.message);
  }
}

export function preloadServerIcons(serverList, max = 20) {
  try {
    if (!Array.isArray(serverList)) return;
    // Collect unique, valid icon URIs from the cache or from getServerIcon
    const uris = [];
    const seen = new Set();
    for (let i = 0; i < serverList.length && uris.length < max; i++) {
      const server = serverList[i];
      if (!server || typeof server.slug !== 'string' || !server.slug) continue;
      let icon = serverIconResponseCache[server.slug]?.icon;
      if (!icon) {
        // Optionally, you could fetch here, but safest is to only use cache
        continue;
      }
      if (
        typeof icon === 'string' &&
        icon.startsWith('http') &&
        !seen.has(icon)
      ) {
        uris.push({uri: icon});
        seen.add(icon);
      }
    }
    if (uris.length > 0) {
      FastImage.preload(uris);
    }
  } catch (e) {
    console.error('preloadServerIcons error:', e);
  }
}
