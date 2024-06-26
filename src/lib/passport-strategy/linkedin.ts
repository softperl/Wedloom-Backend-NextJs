import {
  Strategy as OAuth2Strategy,
  InternalOAuthError,
} from "passport-oauth2";
import * as util from "util";

const profileUrl = "https://api.linkedin.com/v2/userinfo";

class LinkedinStrategy extends OAuth2Strategy {
  private options: any;
  private profileUrl: string;

  constructor(options: any, verify: any) {
    options = options || {};
    options.authorizationURL =
      options.authorizationURL ||
      "https://www.linkedin.com/oauth/v2/authorization";
    options.tokenURL =
      options.tokenURL || "https://www.linkedin.com/oauth/v2/accessToken";
    options.scope = options.scope || ["profile", "email", "openid"];

    // By default, we want data in JSON
    options.customHeaders = options.customHeaders || { "x-li-format": "json" };

    super(options, verify);

    this.options = options;
    this.name = "linkedin";
    this.profileUrl = profileUrl;
  }

  userProfile(
    accessToken: string,
    done: (error?: Error | null, profile?: any) => void
  ) {
    // LinkedIn uses a custom name for the access_token parameter
    this._oauth2.setAccessTokenName("oauth2_access_token");

    this._oauth2.get(this.profileUrl, accessToken, (err, body, _res) => {
      if (err) {
        return done(
          new InternalOAuthError("failed to fetch user profile", err)
        );
      }

      let profile;

      try {
        profile = parseProfile(body);
      } catch (e) {
        return done(
          new InternalOAuthError("failed to parse profile response", e)
        );
      }

      done(null, profile);
    });
  }

  authorizationParams(options: any) {
    const params: { [key: string]: string } = {};

    // LinkedIn requires state parameter. It will return an error if not set.
    if (options.state) {
      params["state"] = options.state;
    }

    return params;
  }
}

function parseProfile(body: any) {
  const json = JSON.parse(body);

  return {
    provider: "linkedin",
    id: json.sub,
    email: json.email,
    givenName: json.given_name,
    familyName: json.family_name,
    displayName: `${json.given_name} ${json.family_name}`,
    picture: json.picture,
    _raw: body,
    _json: json,
  };
}

export default LinkedinStrategy;
