import { CommercialButtonsTestsMutationQueryRawResponse } from "__generated__/CommercialButtonsTestsMutationQuery.graphql"
import { CommercialButtonsTestsRenderQueryRawResponse } from "__generated__/CommercialButtonsTestsRenderQuery.graphql"
import { Button } from "palette"
jest.mock("lib/NativeModules/SwitchBoard", () => ({ presentModalViewController: jest.fn() }))
import { ArtworkFixture } from "lib/__fixtures__/ArtworkFixture"
import SwitchBoard from "lib/NativeModules/SwitchBoard"
import { __appStoreTestUtils__ } from "lib/store/AppStore"
import { flushPromiseQueue } from "lib/tests/flushPromiseQueue"
import { renderRelayTree } from "lib/tests/renderRelayTree"
import { ArtworkInquiryContext } from "lib/utils/ArtworkInquiry/ArtworkInquiryStore"
import React from "react"
import { _FragmentRefs, graphql } from "react-relay"
import { CommercialButtonsFragmentContainer } from "../CommercialButtons"

jest.unmock("react-relay")

const SwitchBoardMock = SwitchBoard as any
const { anything } = expect

afterEach(() => {
  SwitchBoardMock.presentModalViewController.mockReset()
})

// @ts-ignore STRICTNESS_MIGRATION
const componentWithQuery = async ({ mockArtworkData, mockOrderMutationResults, mockOfferMutationResults }) => {
  return await renderRelayTree({
    Component: CommercialButtonsFragmentContainer,
    query: graphql`
      query CommercialButtonsTestsMutationQuery @raw_response_type {
        artwork(id: "artworkID") {
          ...CommercialButtons_artwork
        }
      }
    `,
    mockData: { artwork: mockArtworkData } as CommercialButtonsTestsMutationQueryRawResponse,
    mockMutationResults: {
      commerceCreateOrderWithArtwork: mockOrderMutationResults,
      commerceCreateOfferOrderWithArtwork: mockOfferMutationResults,
    },
  })
}

const state = {
  shippingLocation: null,
  inquiryType: null,
}

const wrapper = (mockArtwork: _FragmentRefs<"CommercialButtons_artwork">): JSX.Element => (
  <ArtworkInquiryContext.Provider
    value={{
      state,
      dispatch: jest.fn(),
    }}
  >
    {/* @ts-ignore */}
    <CommercialButtonsFragmentContainer artwork={mockArtwork} />
  </ArtworkInquiryContext.Provider>
)

// @ts-ignore STRICTNESS_MIGRATION
const relayComponent = async ({ artwork }) => {
  return await renderRelayTree({
    Component: () => wrapper(artwork),
    query: graphql`
      query CommercialButtonsTestsRenderQuery @raw_response_type {
        artwork(id: "artworkID") {
          ...CommercialButtons_artwork
        }
      }
    `,
    mockData: { artwork } as CommercialButtonsTestsRenderQueryRawResponse,
  })
}

describe("CommercialButtons", () => {
  it("renders button for Contact Gallery button if isInquireable", async () => {
    const artwork = {
      ...ArtworkFixture,
      isAcquireable: false,
      isOfferable: false,
      isInquireable: true,
      isForSale: true,
      isPriceHidden: false,
    }

    const commercialButtons = await relayComponent({
      artwork,
    })
    expect(commercialButtons.text()).toContain("Contact gallery")
  })

  it("renders Inquire to Purchase button if isInquireable, price is visible, and lab option is true", async () => {
    __appStoreTestUtils__?.injectEmissionOptions({ AROptionsNewFirstInquiry: true })

    const artwork = {
      ...ArtworkFixture,
      isAcquireable: false,
      isOfferable: false,
      isInquireable: true,
      isForSale: true,
      isPriceHidden: false,
    }

    const commercialButtons = await relayComponent({
      artwork,
    })
    expect(commercialButtons.find(Button).at(0).text()).toContain("Inquire to Purchase")
    expect(commercialButtons.find(Button).at(1).text()).toContain("Contact Gallery")
  })

  it("renders Inquire on Price button if isInquireable, price is hidden, and lab option is true", async () => {
    __appStoreTestUtils__?.injectEmissionOptions({ AROptionsNewFirstInquiry: true })

    const artwork = {
      ...ArtworkFixture,
      isAcquireable: false,
      isOfferable: false,
      isInquireable: true,
      isForSale: true,
      isPriceHidden: true,
    }

    const commercialButtons = await relayComponent({
      artwork,
    })

    expect(commercialButtons.find(Button).at(0).text()).toContain("Request Price")
    expect(commercialButtons.find(Button).at(1).text()).toContain("Contact Gallery")
  })

  it("renders Make Offer button if isOfferable", async () => {
    const artwork = {
      ...ArtworkFixture,
      isAcquireable: false,
      isOfferable: true,
      isInquireable: false,
      isForSale: true,
      isPriceHidden: false,
    }
    const commercialButtons = await relayComponent({
      artwork,
    })
    expect(commercialButtons.text()).toContain("Make offer")
  })

  it("renders Buy Now button if isAcquireable", async () => {
    const artwork = {
      ...ArtworkFixture,
      isAcquireable: true,
      isOfferable: false,
      isInquireable: false,
      isForSale: true,
      isPriceHidden: false,
    }
    const commercialButtons = await relayComponent({
      artwork,
    })
    expect(commercialButtons.text()).toContain("Buy now")
  })

  it("renders Bid button if isInAuction & isBiddable", async () => {
    const artwork = {
      ...ArtworkFixture,
      isAcquireable: false,
      isOfferable: false,
      isInquireable: false,
      isInAuction: true,
      isBiddable: true,
      isForSale: true,
      isPriceHidden: false,
      sale: {
        slug: "kieran-testing-ios-artwork-page",
        internalID: "5d52f117d063bc0007bcb111",
        registrationStatus: null,
        isPreview: false,
        isOpen: true,
        isLiveOpen: false,
        isClosed: false,
        isRegistrationClosed: false,
        requireIdentityVerification: false,
      },
      saleArtwork: {
        increments: [
          {
            cents: 1600000,
            display: "CHF16,000",
          },
        ],
      },
    }
    const commercialButtons = await relayComponent({
      artwork,
    })
    expect(commercialButtons.text()).toContain("Bid")
  })

  it("renders both Buy Now and Make Offer buttons when isOfferable and isAcquireable", async () => {
    const artwork = {
      ...ArtworkFixture,
      isAcquireable: true,
      isOfferable: true,
      isInquireable: false,
      isForSale: true,
      isPriceHidden: false,
    }
    const commercialButtons = await relayComponent({
      artwork,
    })
    expect(commercialButtons.find(Button).at(0).text()).toContain("Buy now")
    expect(commercialButtons.find(Button).at(1).text()).toContain("Make offer")
  })

  it("commits the Buy Now mutation", async () => {
    const artwork = {
      ...ArtworkFixture,
      isForSale: true,
      isAcquireable: true,
      isOfferable: true,
      isInquireable: false,
      isPriceHidden: false,
    }

    const commercialButtons = await componentWithQuery({
      mockArtworkData: artwork,
      mockOrderMutationResults: {
        orderOrError: {
          __typename: "CommerceOrderWithMutationSuccess",
          order: { internalID: "buyNowID", __typename: "CommerceBuyOrder", mode: "BUY" },
        },
      },
      mockOfferMutationResults: {},
    })

    const BuyNowButton = commercialButtons.find(Button).at(0)
    BuyNowButton.props().onPress()
    await flushPromiseQueue()
    expect(SwitchBoardMock.presentModalViewController).toHaveBeenCalledWith(anything(), "/orders/buyNowID")
  })

  it("commits the Make Offer mutation", async () => {
    const artwork = {
      ...ArtworkFixture,
      isAcquireable: true,
      isOfferable: true,
      isInquireable: false,
      isForSale: true,
      isPriceHidden: false,
    }

    const commercialButtons = await componentWithQuery({
      mockArtworkData: artwork,
      mockOrderMutationResults: {},
      mockOfferMutationResults: {
        orderOrError: {
          __typename: "CommerceOrderWithMutationSuccess",
          order: { internalID: "makeOfferID", __typename: "CommerceOfferOrder", mode: "OFFER" },
        },
      },
    })

    const MakeOfferButton = commercialButtons.find(Button).at(1)
    MakeOfferButton.props().onPress()
    await flushPromiseQueue()

    expect(SwitchBoardMock.presentModalViewController).toHaveBeenCalledWith(anything(), "/orders/makeOfferID")
  })

  it("renders both Buy Now and Bid buttons when isInAuction and isBuyNowable", async () => {
    const artwork = {
      ...ArtworkFixture,
      isAcquireable: true,
      isOfferable: false,
      isInquireable: false,
      isForSale: true,
      isInAuction: true,
      isBuyNowable: true,
      saleMessage: "$8000",
      isPriceHidden: false,

      sale: {
        isClosed: false,
        registrationStatus: null,
        isPreview: false,
        isOpen: true,
        isLiveOpen: false,
        isRegistrationClosed: false,
        requireIdentityVerification: false,
      },
      saleArtwork: {
        increments: [{ cents: 320000, display: "€3,200" }],
      },
    }
    const commercialButtons = await relayComponent({
      artwork,
    })
    expect(commercialButtons.find(Button).at(0).text()).toContain("Bid")
    expect(commercialButtons.find(Button).at(1).text()).toContain("Buy now $8000")
  })

  it("doesn't render the Buy Now or Bid buttons when isInAuction and isBuyNowable but has sold via buy now", async () => {
    const artwork = {
      ...ArtworkFixture,
      isAcquireable: false,
      isForSale: false,
      isOfferable: false,
      isInquireable: false,
      isInAuction: true,
      isBuyNowable: true,
      saleMessage: "$8000",
      isPriceHidden: false,
      sale: {
        isClosed: false,
        registrationStatus: null,
        isPreview: false,
        isOpen: true,
        isLiveOpen: false,
        isRegistrationClosed: false,
        requireIdentityVerification: false,
      },
      saleArtwork: {
        increments: [{ cents: 320000, display: "€3,200" }],
      },
    }
    const commercialButtons = await relayComponent({
      artwork,
    })
    expect(commercialButtons.find(Button).length).toEqual(0)
  })
})
