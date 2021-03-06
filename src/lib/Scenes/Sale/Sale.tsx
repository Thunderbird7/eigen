import { Sale_me } from "__generated__/Sale_me.graphql"
import { Sale_sale } from "__generated__/Sale_sale.graphql"
import { SaleQueryRendererQuery } from "__generated__/SaleQueryRendererQuery.graphql"
import Spinner from "lib/Components/Spinner"
import { SwitchMenu } from "lib/Components/SwitchMenu"
import { navigate, popParentViewController } from "lib/navigation/navigate"
import { defaultEnvironment } from "lib/relay/createEnvironment"
import { getCurrentEmissionState } from "lib/store/AppStore"
import { extractNodes } from "lib/utils/extractNodes"
import { renderWithPlaceholder } from "lib/utils/renderWithPlaceholder"
import moment from "moment"
import { Flex } from "palette"
import React, { useEffect, useRef, useState } from "react"
import { Animated } from "react-native"
import { createFragmentContainer, graphql, QueryRenderer } from "react-relay"
import { RegisterToBidButton } from "./Components/RegisterToBidButton"
import { SaleArtworksRailContainer as SaleArtworksRail } from "./Components/SaleArtworksRail"
import { SaleHeaderContainer as SaleHeader } from "./Components/SaleHeader"
import { SaleLotsListContainer as SaleLotsList } from "./Components/SaleLotsList"

interface Props {
  sale: Sale_sale
  me: Sale_me
}

interface SaleSection {
  key: string
  content: JSX.Element
}

export const Sale: React.FC<Props> = (props) => {
  const [showGrid, setShowGrid] = useState(true)

  const saleArtworks = extractNodes(props.sale.saleArtworksConnection)
  const scrollAnim = useRef(new Animated.Value(0)).current

  let intervalId: NodeJS.Timeout

  useEffect(() => {
    if (props.sale.liveStartAt) {
      // poll every .5 seconds to check if sale has gone live
      intervalId = setInterval(checkIfSaleIsLive, 500)
      return () => {
        clearInterval(intervalId)
      }
    }
  }, [])

  const checkIfSaleIsLive = () => {
    const liveStartAt = props.sale.liveStartAt
    if (liveStartAt) {
      const isLiveOpen = moment().isAfter(liveStartAt)
      if (isLiveOpen) {
        switchToLive()
      }
    }
  }

  const switchView = (value: boolean) => {
    setShowGrid(value)
  }

  const switchToLive = () => {
    const { slug } = props.sale
    const liveBaseURL = getCurrentEmissionState().predictionURL
    const liveAuctionURL = `${liveBaseURL}/${slug}`
    navigate(liveAuctionURL)
    setTimeout(popParentViewController, 500)
  }

  const saleSectionsData: SaleSection[] = [
    {
      key: "header",
      content: <SaleHeader sale={props.sale} scrollAnim={scrollAnim} />,
    },
    {
      key: "registerToBid",
      content: (
        <Flex mx="2" mt={2}>
          <RegisterToBidButton sale={props.sale} />
        </Flex>
      ),
    },
    {
      key: "saleArtworksRail",
      content: <SaleArtworksRail saleArtworks={saleArtworks} />,
    },
    //  TODO: Remove this once the filters are implemented
    {
      key: "temporarySwitch",
      content: (
        <Flex px={2}>
          <SwitchMenu
            title={showGrid ? "Show Grid" : "Show List"}
            description="Show list of sale artworks"
            value={showGrid}
            onChange={(value) => switchView(value)}
          />
        </Flex>
      ),
    },
    {
      key: "saleLotsList",
      content: <SaleLotsList me={props.me} showGrid={showGrid} />,
    },
  ]

  return (
    <Animated.FlatList
      data={saleSectionsData}
      initialNumToRender={2}
      renderItem={({ item }: { item: SaleSection }) => item.content}
      keyExtractor={(item: SaleSection) => item.key}
      onScroll={Animated.event(
        [
          {
            nativeEvent: {
              contentOffset: { y: scrollAnim },
            },
          },
        ],
        {
          useNativeDriver: true,
        }
      )}
      scrollEventThrottle={16}
    />
  )
}

export const SaleContainer = createFragmentContainer(Sale, {
  sale: graphql`
    fragment Sale_sale on Sale {
      slug
      liveStartAt
      ...SaleHeader_sale
      ...RegisterToBidButton_sale
      saleArtworksConnection(first: 10) {
        edges {
          node {
            ...SaleArtworksRail_saleArtworks
          }
        }
      }
    }
  `,
  me: graphql`
    fragment Sale_me on Me {
      ...SaleLotsList_me
    }
  `,
})

const Placeholder = () => <Spinner style={{ flex: 1 }} />

export const SaleQueryRenderer: React.FC<{ saleID: string }> = ({ saleID }) => {
  return (
    <QueryRenderer<SaleQueryRendererQuery>
      environment={defaultEnvironment}
      query={graphql`
        query SaleQueryRendererQuery($saleID: String!) {
          sale(id: $saleID) {
            ...Sale_sale
          }
          me {
            ...Sale_me
          }
        }
      `}
      variables={{ saleID }}
      render={renderWithPlaceholder({ Container: SaleContainer, renderPlaceholder: Placeholder })}
    />
  )
}
