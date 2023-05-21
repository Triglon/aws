const cloudfrontSigner = require('aws-cloudfront-sign');

const MILLISECONDS_PER_SECOND = 1000;
const SECONDS_PER_HOUR = 3600;
const DEFAULT_EXPIRE_PERIOD_HOURS = 24 * 30;
const EXPIRE_PERIOD_MILLISECONDS = DEFAULT_EXPIRE_PERIOD_HOURS * SECONDS_PER_HOUR * MILLISECONDS_PER_SECOND;

const cloudfrontURL = 'https://d2isvd9dkfhjxy.cloudfront.net';
const cloudfrontKeyId = 'K6Z02FA9L040R';
const cloudfrontPrivateKey = `
-----BEGIN RSA PRIVATE KEY-----
MIIEowIBAAKCAQEAtAys4lSv8GRI8J7QXb0Ir63oPZ3Qik0gSzOtyDW9NYyZ8+6Y
A0l6MmwqTq9GMWWbnTR2EmFP1p5d/DHZxDsX2JneHph4CYve4a8cYnu7hnMf5n6Q
mcYYqu15zvIpELAOOaGYbDIG/EfCHKDnXt06AgGqiLnzo7Fu9Sd2nMs1GRRJ3VVP
LAnCXY3969HjrBImFxpKLPYokF8Y25uAaOKIhGVeU9YuWns+STe42+Xad6Jf+Yah
AHj0R2H9RVcl48foFaILQbgPc6JpZBH86u4Ry5wGOSzQbn1GXzOlwjGlws1E364R
qUz95HelHxTkeAoiw2NDe0ImA2RQaXLdMKe2uwIDAQABAoIBAQCcfzf2Mi4LAN/1
ZdUu5RQbv0lR5U5SJ9+d/flbQHqJhQB76jLvCHrSQPo1Elwsq2irJ+JI75R5s4V1
o87opYSAnJ1YcqZDhfPgrlg5sdq5bm+X5QLC5lCioW9y1UGkY6K5rR/TS1iPB8BN
Kf5xklDNVa1o0lhXO+554CdU+bvZYzaozyehffKSD9IpMPpLX6fxTOEDMnPDaNur
nrAatFllkha6Hp8OPRBpMkocYWMtQEfVZBipz1Ahej2I7iECDzbk8mx3PbX1MXhe
gTAe5lGZkEUJkzWYCA05+8Q0giaQJHtlbmJ4SCTpsaTs9XyIYOMr2P4f7DgR+nnO
1Q2lXH8hAoGBAOj6JNJ9SE/N4e068c+UeNtDx/tpqCyBu9GCmtUW3QlJnZA1XRaS
FlvJ7x6sdabOC295ImMj5Y0GTnZfBIR1nGTTrZKvzvK0qtqkhG2+AmEBQr+2tBUq
8xBy1cZL6ayH99lBxja9RRqlHEdYNHIW4C9wumxSzJXroVk9zspMCAYNAoGBAMXX
kY6Q7Qonr8kIcQqZYPCUkAu2CmFqvtKNwJphaDjhPjama+SeVD6rWWnH/LTPYM7c
RMGHeewYYqUagmcdT81x6ONOOF0/7mssX9DcQA0LjueomSDjFv6+uHIKDa5CLBqg
CW9uDzLbKebewaD3NJOT93EaSIziF0sKtqi7fAXnAoGAFXtzR8FrmIg4a+KCh4x+
NGGkoAcXDbuMsP3k/v8TtJaII9L32WvxCdet59spIg9fuJCn3hJiSUWqmHmcdgZO
PHHUUHFLmM+V7YE8AM6Dc6RlHj5fjpAeR4b/NUCstE75SJwrBcMgCxvsZpu4gkif
tWAkoHZmDPDkONFdLwQhvUUCgYA9Y9bW1kG3lPkG+IebMlzSSkcoWyR9dhIgY7wQ
K4mbnMkhTCLOnhKmH6VvHY9cy7zOc6siIlfC2w5BDSjJtl688UvCvNLgnKXuu6Y/
uRhm8980Iyzg95Z7FdNGD7iPChmFaYOEADLXJQqriROsTwkRgiiWAAHjNYTk1D45
vXOOoQKBgB2/aNa1hC+8WcO/vdATez9i9HTTnx72Uk5Ni3ByjVQoACtlNFXMUprY
6rMk4utHfFem7JzujmxTPGX8d4k3pWLSfe2O7ALraJASnragipqhXcwc9Ad/yPMO
u/saNNrTt4/wc//+PWQJxmN7U7hGOLv6aDtXnxq8i1/XJaeSskuw
-----END RSA PRIVATE KEY-----
`;

class CloudFrontHelper {
  // when inside environment Variables, the RSA key loses the
  // required formatting, so we reformat it using this function
  static processKeyString = (keyString) => {
    const beginString = '-----BEGIN RSA PRIVATE KEY-----';
    const endString = '-----END RSA PRIVATE KEY-----';
    let processedKey = keyString.replace(beginString, '').replace(/"/g, '\n');
    processedKey = processedKey.replace(endString, '\n');
    processedKey = processedKey.replace(/\s+/g, '\n');
    processedKey = `${beginString}${processedKey}${endString}`;
    return processedKey;
  };

  static getSignedUrlFromPath = (pathName, expiryTime = 0) => {
    if (pathName) {
      const url = new URL(pathName, cloudfrontURL);
      return this.urlSigner(url.href, expiryTime);
    } else {
      return null;
    }
  };
  static urlSigner = (url, expiryTime = 0) => {
    if (expiryTime === 0) {
      // unix timestamp in milliseconds
      expiryTime = Math.floor(new Date().getTime()) + EXPIRE_PERIOD_MILLISECONDS;
    }

    const signingParams = {
      keypairId: cloudfrontKeyId,
      privateKeyString: this.processKeyString(cloudfrontPrivateKey),
      expireTime: expiryTime,
    };
    return cloudfrontSigner.getSignedUrl(url, signingParams);
  };
}

const url = CloudFrontHelper.getSignedUrlFromPath('dummy.pdf');
console.log(url);
