import { FilterParamName } from "lib/utils/ArtworkFilter/FilterArtworksHelpers"
import { filter, find, pullAllBy, union, unionBy } from "lodash"
import React, { createContext, Dispatch, Reducer, useContext, useReducer } from "react"

const filterState: ArtworkFilterContextState = {
  appliedFilters: [],
  selectedFilters: [],
  previouslyAppliedFilters: [],
  applyFilters: false,
  aggregations: [],
}

export const reducer = (
  artworkFilterState: ArtworkFilterContextState,
  action: FilterActions
): ArtworkFilterContextState => {
  switch (action.type) {
    case "applyFilters":
      let multiOptionFilters = unionBy(
        artworkFilterState.selectedFilters,
        artworkFilterState.previouslyAppliedFilters,
        "paramName"
      )

      multiOptionFilters = multiOptionFilters.filter((f) => f.paramValue === true)

      // get all filter options excluding ways to buy filter types and replace previously applied options with currently selected options
      const singleOptionFilters = unionBy(
        pullAllBy(
          [...artworkFilterState.selectedFilters, ...artworkFilterState.previouslyAppliedFilters],
          multiOptionFilters,
          "paramValue"
        ),
        ({ paramValue, paramName }) => {
          // We don't want to union the artistID params, as each entry corresponds to a
          // different artist that may be selected. Instead we de-dupe based on the paramValue.
          if (paramName === FilterParamName.artist) {
            return paramValue
          } else {
            return paramName
          }
        }
      )

      const filtersToApply = union([...singleOptionFilters, ...multiOptionFilters])

      // Remove default values as those are accounted for when we make the API request.
      const appliedFilters = filter(filtersToApply, ({ paramName, paramValue }) => {
        // This logic is specific to filters that allow for multiple options. Right now
        // it only applies to the artist filter, but this will likely change.
        if (paramName === FilterParamName.artist) {
          // See if we have an existing entry in previouslyAppliedFilters
          const hasExistingPreviouslyAppliedFilter = artworkFilterState.previouslyAppliedFilters.find(
            (previouslyAppliedFilter) =>
              paramName === previouslyAppliedFilter.paramName && paramValue === previouslyAppliedFilter.paramValue
          )

          const hasExistingSelectedAppliedFilter = artworkFilterState.selectedFilters.find(
            (selectedFilter) => paramName === selectedFilter.paramName && paramValue === selectedFilter.paramValue
          )

          // If so, it means that this filter had been previously applied and is now being de-selected.
          // We need it to exist in the "selectedFilters" array so that our counts, etc. are correct,
          // but it's technically de-selected.
          return !(hasExistingPreviouslyAppliedFilter && hasExistingSelectedAppliedFilter)
        }
        return defaultFilterOptions[paramName] !== paramValue
      })

      return {
        applyFilters: true,
        appliedFilters,
        selectedFilters: [],
        previouslyAppliedFilters: appliedFilters,
        aggregations: artworkFilterState.aggregations,
      }

    // First we update our potential "selectedFilters" based on the option that was selected in the UI
    case "selectFilters":
      let filtersToSelect
      let removedOption = false

      // This logic is specific to filters that can have multiple options. Right now it only
      // applies to the artist filter, but this will likely change in the future.
      if (action.payload.paramName === FilterParamName.artist) {
        const filtersWithoutSelectedArtist = artworkFilterState.selectedFilters.filter(({ paramName, paramValue }) => {
          if (paramName === FilterParamName.artist && paramValue === action.payload.paramValue) {
            removedOption = true
            return false
          }
          return true
        })

        if (removedOption) {
          // An artist is "selected" when it is present in the selectedFilters array. To de-select,
          // we simply remove it from the array.
          filtersToSelect = filtersWithoutSelectedArtist
        } else {
          // If the artist was not already selected, then we add it to the array like normal.
          filtersToSelect = [...artworkFilterState.selectedFilters, action.payload]
        }
      } else {
        filtersToSelect = unionBy([action.payload], artworkFilterState.selectedFilters, "paramName")
      }

      // Then we have to remove any "invalid" choices.
      const selectedFilters = filter(filtersToSelect, ({ paramName, paramValue }) => {
        const appliedFilter = find(artworkFilterState.appliedFilters, (option) => option.paramName === paramName)

        // Don't re-select options that have already been applied.
        // In the case where the option hasn't been applied, remove the option if it is the default.
        if (!appliedFilter) {
          return defaultFilterOptions[paramName] !== paramValue
        }

        if (appliedFilter.paramValue === paramValue) {
          // Ignore this case when it's an artistID.
          return appliedFilter.paramName === FilterParamName.artist
        }

        return true
      })

      return {
        applyFilters: false,
        selectedFilters,
        appliedFilters: artworkFilterState.appliedFilters,
        previouslyAppliedFilters: artworkFilterState.previouslyAppliedFilters,
        aggregations: artworkFilterState.aggregations,
      }

    case "clearAll":
      return {
        appliedFilters: artworkFilterState.appliedFilters,
        selectedFilters: [],
        previouslyAppliedFilters: [],
        applyFilters: false,
        aggregations: artworkFilterState.aggregations,
      }

    case "resetFilters":
      // We call this when we need to re-set to our initial state. Since previouslyAppliedFilters
      // is only used while in the filter modal, when we close out we need to re-set that back
      // to equal appliedFilters.
      return {
        applyFilters: false,
        appliedFilters: artworkFilterState.appliedFilters,
        selectedFilters: [],
        previouslyAppliedFilters: artworkFilterState.appliedFilters,
        aggregations: artworkFilterState.aggregations,
      }

    case "clearFiltersZeroState":
      // We call this when a user has filtered artworks and the result returns 0 artworks.
      return {
        appliedFilters: [],
        selectedFilters: [],
        previouslyAppliedFilters: [],
        applyFilters: true,
        aggregations: artworkFilterState.aggregations,
      }

    case "setAggregations":
      return {
        aggregations: action.payload,
        appliedFilters: artworkFilterState.appliedFilters,
        selectedFilters: artworkFilterState.selectedFilters,
        previouslyAppliedFilters: artworkFilterState.previouslyAppliedFilters,
        applyFilters: false,
      }

    case "setInitialFilterState":
      return {
        appliedFilters: action.payload,
        selectedFilters: [],
        previouslyAppliedFilters: action.payload,
        applyFilters: false,
        aggregations: artworkFilterState.aggregations,
      }
  }
}

export const ParamDefaultValues = {
  sort: "-decayed_merch",
  medium: "*",
  priceRange: "*-*",
  dimensionRange: "*-*",
  color: undefined,
  partnerID: undefined,
  majorPeriods: undefined,
  inquireableOnly: false,
  offerable: false,
  atAuction: false,
  acquireable: false,
  includeArtworksByFollowedArtists: false,
  artistIDs: [],
}

const defaultFilterOptions: Record<FilterParamName, string | boolean | undefined | string[]> = {
  sort: ParamDefaultValues.sort,
  medium: ParamDefaultValues.medium,
  priceRange: ParamDefaultValues.priceRange,
  dimensionRange: ParamDefaultValues.dimensionRange,
  color: ParamDefaultValues.color,
  partnerID: ParamDefaultValues.partnerID,
  majorPeriods: ParamDefaultValues.majorPeriods,
  inquireableOnly: ParamDefaultValues.inquireableOnly,
  offerable: ParamDefaultValues.offerable,
  atAuction: ParamDefaultValues.atAuction,
  acquireable: ParamDefaultValues.acquireable,
  includeArtworksByFollowedArtists: ParamDefaultValues.includeArtworksByFollowedArtists,
  artistIDs: ParamDefaultValues.artistIDs,
}

export const selectedOptionsUnion = ({
  selectedFilters,
  previouslyAppliedFilters,
}: {
  selectedFilters: FilterArray
  previouslyAppliedFilters: FilterArray
}): FilterArray => {
  const defaultFilters: FilterArray = [
    {
      paramName: FilterParamName.sort,
      paramValue: "-decayed_merch",
      displayText: "Default",
    },
    { paramName: FilterParamName.medium, paramValue: "*", displayText: "All" },
    { paramName: FilterParamName.priceRange, paramValue: "*-*", displayText: "All" },
    { paramName: FilterParamName.size, paramValue: "*-*", displayText: "All" },
    { paramName: FilterParamName.gallery, displayText: "All" },
    {
      paramName: FilterParamName.institution,
      displayText: "All",
    },
    { paramName: FilterParamName.color, displayText: "All" },
    { paramName: FilterParamName.timePeriod, paramValue: "*-*", displayText: "All" },
    {
      paramName: FilterParamName.waysToBuyBuy,
      paramValue: false,
      displayText: "Buy now",
    },
    {
      paramName: FilterParamName.waysToBuyInquire,
      paramValue: false,
      displayText: "Inquire",
    },
    {
      paramName: FilterParamName.waysToBuyMakeOffer,
      paramValue: false,
      displayText: "Make offer",
    },
    {
      paramName: FilterParamName.waysToBuyBid,
      paramValue: false,
      displayText: "Bid",
    },
    {
      paramName: FilterParamName.artistsIFollow,
      paramValue: false,
      displayText: "All artists I follow",
    },
  ]

  // First, naively attempt to union all of the existing filters. Give selectedFilters
  // precedence over previouslyAppliedFilters and defaultFilters.
  const preliminarySelectedFilters = unionBy(
    selectedFilters,
    previouslyAppliedFilters,
    defaultFilters,
    ({ paramValue, paramName }) => {
      if (paramName === FilterParamName.artist) {
        return paramValue
      } else {
        return paramName
      }
    }
  )

  // Then, handle the case where a multi-select option is technically de-selected.
  return preliminarySelectedFilters.filter(({ paramName, paramValue }) => {
    if (paramName === FilterParamName.artist) {
      // See if we have an existing entry in previouslyAppliedFilters
      const hasExistingPreviouslyAppliedFilter = previouslyAppliedFilters.find(
        (previouslyAppliedFilter) =>
          paramName === previouslyAppliedFilter.paramName && paramValue === previouslyAppliedFilter.paramValue
      )

      const hasExistingSelectedAppliedFilter = selectedFilters.find(
        (selectedFilter) => paramName === selectedFilter.paramName && paramValue === selectedFilter.paramValue
      )

      // If so, it means that this filter had been previously applied and is now being de-selected.
      // We need it to exist in the "selectedFilters" array so that our counts, etc. are correct,
      // but it's technically de-selected.
      return !(hasExistingPreviouslyAppliedFilter && hasExistingSelectedAppliedFilter)
    }
    return true
  })
}

export const useSelectedOptionsDisplay = (): FilterArray => {
  const { state } = useContext(ArtworkFilterContext)

  return selectedOptionsUnion({
    selectedFilters: state.selectedFilters,
    previouslyAppliedFilters: state.previouslyAppliedFilters,
  })
}

export const ArtworkFilterContext = createContext<ArtworkFilterContextProps>(null as any /* STRICTNESS_MIGRATION */)

export const ArtworkFilterGlobalStateProvider = ({ children }: any /* STRICTNESS_MIGRATION */) => {
  const [state, dispatch] = useReducer<Reducer<ArtworkFilterContextState, FilterActions>>(reducer, filterState)
  return <ArtworkFilterContext.Provider value={{ state, dispatch }}>{children}</ArtworkFilterContext.Provider>
}

export interface ArtworkFilterContextState {
  readonly appliedFilters: FilterArray
  readonly selectedFilters: FilterArray
  readonly previouslyAppliedFilters: FilterArray
  readonly applyFilters: boolean
  readonly aggregations: Aggregations
}

export interface FilterData {
  readonly displayText: string
  readonly paramName: FilterParamName
  paramValue?: string | boolean
  filterKey?: string // gallery and institution share a paramName so need to distinguish
}

export type FilterArray = ReadonlyArray<FilterData>

interface ResetFilters {
  type: "resetFilters"
}

interface ApplyFilters {
  type: "applyFilters"
}

interface SelectFilters {
  type: "selectFilters"
  payload: FilterData
}

interface ClearAllFilters {
  type: "clearAll"
}

interface ClearFiltersZeroState {
  type: "clearFiltersZeroState"
}

interface SetAggregations {
  type: "setAggregations"
  payload: any
}

interface SetInitialFilterState {
  type: "setInitialFilterState"
  payload: FilterArray
}

export type FilterActions =
  | ResetFilters
  | ApplyFilters
  | SelectFilters
  | ClearAllFilters
  | ClearFiltersZeroState
  | SetAggregations
  | SetInitialFilterState

interface ArtworkFilterContextProps {
  state: ArtworkFilterContextState
  dispatch: Dispatch<FilterActions>
}

/**
 * Possible aggregations that can be passed
 */
export type AggregationName =
  | "COLOR"
  | "DIMENSION_RANGE"
  | "GALLERY"
  | "INSTITUTION"
  | "MAJOR_PERIOD"
  | "MEDIUM"
  | "PRICE_RANGE"
  | "FOLLOWED_ARTISTS"
  | "ARTIST"

export type Aggregations = Array<{
  slice: AggregationName
  counts: Array<{
    count: number
    value: string
    name: string
  }>
}>
