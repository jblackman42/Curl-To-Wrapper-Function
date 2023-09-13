function convertCurlToFunction(curlCommand) {
  try {
    const methodMatch = curlCommand.match(/-X\s+(\w+)/);
    const method = methodMatch ? methodMatch[1].toLowerCase() : 'get';

    const urlMatch = curlCommand.match(/'https?:\/\/(.*?)(?=\s|$)/);
    if (!urlMatch) {
      throw new Error('URL not found in the curl command.');
    }

    const urlString = 'https://' + urlMatch[1].slice(0, -1);
    const url = new URL(urlString);

    const path = url.pathname.replace('/ministryplatformapi', '');

    const queryParams = {};
    const decodedQuery = decodeURIComponent(url.search).replace('?', '');
    if (decodedQuery) {
      const queryList = decodedQuery.split('&');
      queryList.forEach(query => {
        const param = query.split('=')[0];
        const value = query.substring(query.indexOf('=') + 1);
        queryParams[param] = value;
      });
    }

    const regex = /-d '([^']*)'/;
    const bodyMatch = curlCommand.match(regex);
    const body = bodyMatch ? JSON.parse(bodyMatch[1]) : {};

    return `await MinistryPlatformAPI.request('${method}', '${path}', ${JSON.stringify(queryParams)}, ${JSON.stringify(body)})`;
  } catch (error) {
    console.error(error);
    return `Error: ${error.message}`;
  }
}

const curlConverterForm = document.getElementById('curl-converter');
curlConverterForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const curlInputDOM = document.getElementById('curl-command');
  const responseContainerDOM = document.getElementById('response-container');
  const functionString = convertCurlToFunction(curlInputDOM.value);
  // console.log(functionString);
  responseContainerDOM.innerHTML = `<code>${functionString}</code>`;
});

document.getElementById('copy-code').addEventListener('click', () => {
  const codeDOM = document.querySelector('code');
  if (codeDOM && codeDOM.textContent) {
    navigator.clipboard.writeText(codeDOM.textContent);
    console.log('Copied: ' + codeDOM.textContent)
  }
})