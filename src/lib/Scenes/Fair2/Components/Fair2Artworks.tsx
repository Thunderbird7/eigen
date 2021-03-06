import { OwnerType } from "@artsy/cohesion"
import { Fair2Artworks_fair } from "__generated__/Fair2Artworks_fair.graphql"
import { FilteredArtworkGridZeroState } from "lib/Components/ArtworkGrids/FilteredArtworkGridZeroState"
import { InfiniteScrollArtworksGridContainer } from "lib/Components/ArtworkGrids/InfiniteScrollArtworksGrid"
import { FAIR2_ARTWORKS_PAGE_SIZE } from "lib/data/constants"
import { ArtworkFilterContext, FilterArray } from "lib/utils/ArtworkFilter/ArtworkFiltersStore"
import {
  aggregationsType,
  aggregationsWithFollowedArtists,
  filterArtworksParams,
} from "lib/utils/ArtworkFilter/FilterArtworksHelpers"
import { Schema } from "lib/utils/track"
import { Box } from "palette"
import React, { useContext, useEffect } from "react"
import { createPaginationContainer, graphql, RelayPaginationProp } from "react-relay"
import { useTracking } from "react-tracking"

interface Fair2ArtworksProps {
  fair: Fair2Artworks_fair
  relay: RelayPaginationProp
  initiallyAppliedFilter?: FilterArray
}

export const Fair2Artworks: React.FC<Fair2ArtworksProps> = ({ fair, relay, initiallyAppliedFilter }) => {

  const artworks = fair.fairArtworks!
  const { dispatch, state } = useContext(ArtworkFilterContext)
  const tracking = useTracking()
  const filterParams = filterArtworksParams(state.appliedFilters)

  const trackClear = (id: string, slug: string) => {
    tracking.trackEvent({
      action_name: "clearFilters",
      context_screen: Schema.ContextModules.ArtworkGrid,
      context_screen_owner_type: Schema.OwnerEntityTypes.Fair,
      context_screen_owner_id: id,
      context_screen_owner_slug: slug,
      action_type: Schema.ActionTypes.Tap,
    })
  }

  useEffect(() => {
    if (initiallyAppliedFilter) {
      dispatch({ type: "setInitialFilterState", payload: initiallyAppliedFilter })
    }
  }, [])

  useEffect(() => {
    if (state.applyFilters) {
      relay.refetchConnection(
        FAIR2_ARTWORKS_PAGE_SIZE,
        (error) => {
          if (error) {
            throw new Error("Fair/FairArtworks filter error: " + error.message)
          }
        },
        filterParams
      )
    }
  }, [state.appliedFilters])

  const followedArtistCount = artworks?.counts?.followedArtists ?? 0
  const artworkAggregations = (artworks?.aggregations ?? []) as aggregationsType
  const aggregations = aggregationsWithFollowedArtists(followedArtistCount, artworkAggregations)

  useEffect(() => {
    dispatch({
      type: "setAggregations",
      payload: aggregations,
    })
  }, [])

  if ((artworks?.counts?.total ?? 0) === 0) {
    return (
      <Box mb="80px">
        <FilteredArtworkGridZeroState id={fair.internalID} slug={fair.slug} trackClear={trackClear} />
      </Box>
    )
  }

  return (
    <Box mb={3}>
      <InfiniteScrollArtworksGridContainer
        connection={artworks}
        loadMore={relay.loadMore}
        hasMore={relay.hasMore}
        autoFetch={false}
        pageSize={FAIR2_ARTWORKS_PAGE_SIZE}
        contextScreenOwnerType={OwnerType.fair}
        contextScreenOwnerId={fair.internalID}
        contextScreenOwnerSlug={fair.slug}
      />
    </Box>
  )
}

export const Fair2ArtworksFragmentContainer = createPaginationContainer(
  Fair2Artworks,
  {
    fair: graphql`
      fragment Fair2Artworks_fair on Fair
      @argumentDefinitions(
        count: { type: "Int", defaultValue: 30 }
        cursor: { type: "String" }
        sort: { type: "String", defaultValue: "-decayed_merch" }
        medium: { type: "String", defaultValue: "*" }
        priceRange: { type: "String" }
        color: { type: "String" }
        partnerID: { type: "ID" }
        dimensionRange: { type: "String", defaultValue: "*-*" }
        majorPeriods: { type: "[String]" }
        acquireable: { type: "Boolean" }
        inquireableOnly: { type: "Boolean" }
        atAuction: { type: "Boolean" }
        offerable: { type: "Boolean" }
        includeArtworksByFollowedArtists: { type: "Boolean" }
        artistIDs: { type: "[String]" }
      ) {
        slug
        internalID
        fairArtworks: filterArtworksConnection(
          first: 30
          after: $cursor
          sort: $sort
          medium: $medium
          priceRange: $priceRange
          color: $color
          partnerID: $partnerID
          dimensionRange: $dimensionRange
          majorPeriods: $majorPeriods
          acquireable: $acquireable
          inquireableOnly: $inquireableOnly
          atAuction: $atAuction
          offerable: $offerable
          includeArtworksByFollowedArtists: $includeArtworksByFollowedArtists
          artistIDs: $artistIDs
          aggregations: [
            COLOR
            DIMENSION_RANGE
            GALLERY
            INSTITUTION
            MAJOR_PERIOD
            MEDIUM
            PRICE_RANGE
            FOLLOWED_ARTISTS
            ARTIST
          ]
        ) @connection(key: "Fair_fairArtworks") {
          aggregations {
            slice
            counts {
              count
              name
              value
            }
          }
          edges {
            node {
              id
            }
          }
          counts {
            total
            followedArtists
          }
          ...InfiniteScrollArtworksGrid_connection
        }
      }
    `,
  },
  {
    getConnectionFromProps(props) {
      return props?.fair.fairArtworks
    },
    getFragmentVariables(previousVariables, count) {
      // Relay is unable to infer this for this component, I'm not sure why.
      return {
        ...previousVariables,
        count,
      }
    },
    getVariables(props, { count, cursor }, fragmentVariables) {
      return {
        ...fragmentVariables,
        props,
        count,
        cursor,
        id: props.fair.slug,
      }
    },
    query: graphql`
      query Fair2ArtworksInfiniteScrollGridQuery(
        $id: String!
        $count: Int!
        $cursor: String
        $sort: String
        $medium: String
        $priceRange: String
        $color: String
        $partnerID: ID
        $dimensionRange: String
        $majorPeriods: [String]
        $acquireable: Boolean
        $inquireableOnly: Boolean
        $atAuction: Boolean
        $offerable: Boolean
        $includeArtworksByFollowedArtists: Boolean
        $artistIDs: [String]
      ) {
        fair(id: $id) {
          ...Fair2Artworks_fair
          @arguments(
            count: $count
            cursor: $cursor
            sort: $sort
            medium: $medium
            color: $color
            partnerID: $partnerID
            priceRange: $priceRange
            dimensionRange: $dimensionRange
            majorPeriods: $majorPeriods
            acquireable: $acquireable
            inquireableOnly: $inquireableOnly
            atAuction: $atAuction
            offerable: $offerable
            includeArtworksByFollowedArtists: $includeArtworksByFollowedArtists
            artistIDs: $artistIDs
          )
        }
      }
    `,
  }
)
