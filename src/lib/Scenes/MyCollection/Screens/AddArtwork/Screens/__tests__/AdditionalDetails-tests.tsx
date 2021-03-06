import { useFormikContext } from "formik"
import { Checkbox } from "lib/Components/Bidding/Components/Checkbox"
import { renderWithWrappers } from "lib/tests/renderWithWrappers"
import React from "react"
import { AdditionalDetails } from "../AdditionalDetails"

jest.mock("formik")

describe("AdditionalDetails", () => {
  const useFormikContextMock = useFormikContext as jest.Mock

  beforeEach(() => {
    useFormikContextMock.mockImplementation(() => ({
      handleBlur: jest.fn(),
      handleChange: jest.fn(),
      values: {
        medium: "Painting",
      },
    }))
  })

  it("renders edition form data by default if present", () => {
    useFormikContextMock.mockImplementation(() => ({
      handleBlur: jest.fn(),
      handleChange: jest.fn(),
      values: {
        editionSize: "10x30x10",
        editionNumber: "1",
      },
    }))

    const wrapper = renderWithWrappers(<AdditionalDetails />)

    expect(wrapper.root.findByType(Checkbox).props.checked).toBe(true)
    expect(wrapper.root.findByProps({ "data-test-id": "EditionSizeInput" }).props.defaultValue).toBe("10x30x10")
    expect(wrapper.root.findByProps({ "data-test-id": "EditionNumberInput" }).props.defaultValue).toBe("1")
  })

  it("renders correct fields", () => {
    const wrapper = renderWithWrappers(<AdditionalDetails />)

    // FIXME: This will change once edition fields are wired up and we show / hide
    // based on overall form state. For now, press and show everything.
    wrapper.root.findByProps({ "data-test-id": "EditionCheckbox" }).props.onPress()

    const fields = [
      "TitleInput",
      "DateInput",
      "EditionCheckbox",
      "EditionNumberInput",
      "EditionSizeInput",
      "MaterialsInput",
      "PricePaidInput",
      "CurrencyInput",
    ]
    fields.forEach((field) => {
      expect(wrapper.root.findByProps({ "data-test-id": field })).toBeDefined()
    })
  })
})
