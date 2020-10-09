/* tslint:disable */
/* eslint-disable */
// @ts-nocheck
/* @relayHash f08fa70f8678f8351b42f7a0696daf44 */

import { ConcreteRequest } from "relay-runtime";
import { FragmentRefs } from "relay-runtime";
export type Fair2FollowedArtistsTestsQueryVariables = {
    fairID: string;
};
export type Fair2FollowedArtistsTestsQueryResponse = {
    readonly fair: {
        readonly " $fragmentRefs": FragmentRefs<"Fair2FollowedArtists_fair">;
    } | null;
};
export type Fair2FollowedArtistsTestsQueryRawResponse = {
    readonly fair: ({
        readonly internalID: string;
        readonly slug: string;
        readonly followedArtistArtworks: ({
            readonly edges: ReadonlyArray<({
                readonly artwork: ({
                    readonly id: string;
                    readonly internalID: string;
                    readonly slug: string;
                    readonly href: string | null;
                    readonly artistNames: string | null;
                    readonly image: ({
                        readonly imageURL: string | null;
                    }) | null;
                    readonly saleMessage: string | null;
                }) | null;
            }) | null> | null;
            readonly id: string;
        }) | null;
        readonly id: string;
    }) | null;
};
export type Fair2FollowedArtistsTestsQuery = {
    readonly response: Fair2FollowedArtistsTestsQueryResponse;
    readonly variables: Fair2FollowedArtistsTestsQueryVariables;
    readonly rawResponse: Fair2FollowedArtistsTestsQueryRawResponse;
};



/*
query Fair2FollowedArtistsTestsQuery(
  $fairID: String!
) {
  fair(id: $fairID) {
    ...Fair2FollowedArtists_fair
    id
  }
}

fragment ArtworkTileRailCard_artwork on Artwork {
  slug
  internalID
  href
  artistNames
  image {
    imageURL
  }
  saleMessage
}

fragment Fair2FollowedArtists_fair on Fair {
  internalID
  slug
  followedArtistArtworks: filterArtworksConnection(includeArtworksByFollowedArtists: true, first: 20) {
    edges {
      artwork: node {
        id
        internalID
        slug
        ...ArtworkTileRailCard_artwork
      }
    }
    id
  }
}
*/

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "fairID"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "fairID"
  }
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "internalID",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "slug",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v5 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "String"
},
v6 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "ID"
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "Fair2FollowedArtistsTestsQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "Fair",
        "kind": "LinkedField",
        "name": "fair",
        "plural": false,
        "selections": [
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "Fair2FollowedArtists_fair"
          }
        ],
        "storageKey": null
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "Fair2FollowedArtistsTestsQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "Fair",
        "kind": "LinkedField",
        "name": "fair",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          (v3/*: any*/),
          {
            "alias": "followedArtistArtworks",
            "args": [
              {
                "kind": "Literal",
                "name": "first",
                "value": 20
              },
              {
                "kind": "Literal",
                "name": "includeArtworksByFollowedArtists",
                "value": true
              }
            ],
            "concreteType": "FilterArtworksConnection",
            "kind": "LinkedField",
            "name": "filterArtworksConnection",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "FilterArtworksEdge",
                "kind": "LinkedField",
                "name": "edges",
                "plural": true,
                "selections": [
                  {
                    "alias": "artwork",
                    "args": null,
                    "concreteType": "Artwork",
                    "kind": "LinkedField",
                    "name": "node",
                    "plural": false,
                    "selections": [
                      (v4/*: any*/),
                      (v2/*: any*/),
                      (v3/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "href",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "artistNames",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "Image",
                        "kind": "LinkedField",
                        "name": "image",
                        "plural": false,
                        "selections": [
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "imageURL",
                            "storageKey": null
                          }
                        ],
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "saleMessage",
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": null
              },
              (v4/*: any*/)
            ],
            "storageKey": "filterArtworksConnection(first:20,includeArtworksByFollowedArtists:true)"
          },
          (v4/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "id": "f08fa70f8678f8351b42f7a0696daf44",
    "metadata": {
      "relayTestingSelectionTypeInfo": {
        "fair": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Fair"
        },
        "fair.followedArtistArtworks": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "FilterArtworksConnection"
        },
        "fair.followedArtistArtworks.edges": {
          "enumValues": null,
          "nullable": true,
          "plural": true,
          "type": "FilterArtworksEdge"
        },
        "fair.followedArtistArtworks.edges.artwork": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Artwork"
        },
        "fair.followedArtistArtworks.edges.artwork.artistNames": (v5/*: any*/),
        "fair.followedArtistArtworks.edges.artwork.href": (v5/*: any*/),
        "fair.followedArtistArtworks.edges.artwork.id": (v6/*: any*/),
        "fair.followedArtistArtworks.edges.artwork.image": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Image"
        },
        "fair.followedArtistArtworks.edges.artwork.image.imageURL": (v5/*: any*/),
        "fair.followedArtistArtworks.edges.artwork.internalID": (v6/*: any*/),
        "fair.followedArtistArtworks.edges.artwork.saleMessage": (v5/*: any*/),
        "fair.followedArtistArtworks.edges.artwork.slug": (v6/*: any*/),
        "fair.followedArtistArtworks.id": (v6/*: any*/),
        "fair.id": (v6/*: any*/),
        "fair.internalID": (v6/*: any*/),
        "fair.slug": (v6/*: any*/)
      }
    },
    "name": "Fair2FollowedArtistsTestsQuery",
    "operationKind": "query",
    "text": null
  }
};
})();
(node as any).hash = 'ec18f2799e2fc0655846d8ef570fb2d0';
export default node;
