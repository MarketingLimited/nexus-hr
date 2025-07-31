import { screen, waitFor } from '@testing-library/dom'
import { expect } from 'vitest'

// Common assertion helpers
export const expectToBeVisible = (element: HTMLElement) => {
  expect(element).toBeInTheDocument()
  expect(element).toBeVisible()
}

export const expectToBeHidden = (element: HTMLElement) => {
  expect(element).not.toBeVisible()
}

// Text and content assertions
export const expectTextToBePresent = (text: string | RegExp) => {
  expect(screen.getByText(text)).toBeInTheDocument()
}

export const expectTextNotToBePresent = (text: string | RegExp) => {
  expect(screen.queryByText(text)).not.toBeInTheDocument()
}

// Form assertions
export const expectFormFieldToHaveValue = (labelText: string | RegExp, value: string) => {
  const field = screen.getByLabelText(labelText)
  expect(field).toHaveValue(value)
}

export const expectFormFieldToBeInvalid = (labelText: string | RegExp) => {
  const field = screen.getByLabelText(labelText)
  expect(field).toBeInvalid()
}

export const expectFormFieldToBeValid = (labelText: string | RegExp) => {
  const field = screen.getByLabelText(labelText)
  expect(field).toBeValid()
}

// Button and link assertions
export const expectButtonToBeDisabled = (buttonName: string | RegExp) => {
  const button = screen.getByRole('button', { name: buttonName })
  expect(button).toBeDisabled()
}

export const expectButtonToBeEnabled = (buttonName: string | RegExp) => {
  const button = screen.getByRole('button', { name: buttonName })
  expect(button).toBeEnabled()
}

export const expectLinkToHaveHref = (linkName: string | RegExp, href: string) => {
  const link = screen.getByRole('link', { name: linkName })
  expect(link).toHaveAttribute('href', href)
}

// Table assertions
export const expectTableToHaveRows = (expectedRowCount: number) => {
  const rows = screen.getAllByRole('row')
  // Subtract 1 for the header row
  expect(rows).toHaveLength(expectedRowCount + 1)
}

export const expectTableCellToHaveText = (rowIndex: number, cellIndex: number, text: string | RegExp) => {
  const rows = screen.getAllByRole('row')
  const cells = rows[rowIndex].querySelectorAll('td')
  expect(cells[cellIndex]).toHaveTextContent(text)
}

// Loading and async assertions
export const expectLoadingToBeVisible = () => {
  expect(screen.getByText(/loading/i)).toBeInTheDocument()
}

export const expectLoadingToBeHidden = async () => {
  await waitFor(() => {
    expect(screen.queryByText(/loading/i)).not.toBeInTheDocument()
  })
}

// Error assertions
export const expectErrorToBeVisible = (errorMessage?: string | RegExp) => {
  const errorElement = errorMessage 
    ? screen.getByText(errorMessage)
    : screen.getByRole('alert')
  expect(errorElement).toBeInTheDocument()
}

export const expectNoErrorsToBeVisible = () => {
  expect(screen.queryByRole('alert')).not.toBeInTheDocument()
}

// Modal and dialog assertions
export const expectModalToBeOpen = (modalTitle?: string | RegExp) => {
  const modal = modalTitle
    ? screen.getByRole('dialog', { name: modalTitle })
    : screen.getByRole('dialog')
  expect(modal).toBeInTheDocument()
}

export const expectModalToBeClosed = () => {
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
}

// Navigation assertions
export const expectToBeOnPage = (path: string) => {
  expect(window.location.pathname).toBe(path)
}

// List assertions
export const expectListToHaveItems = (listRole: string, expectedCount: number) => {
  const list = screen.getByRole(listRole)
  const items = list.querySelectorAll('[role="listitem"]')
  expect(items).toHaveLength(expectedCount)
}

// Accessibility assertions
export const expectToHaveAriaLabel = (element: HTMLElement, label: string) => {
  expect(element).toHaveAttribute('aria-label', label)
}

export const expectToHaveAriaDescribedBy = (element: HTMLElement, describedById: string) => {
  expect(element).toHaveAttribute('aria-describedby', describedById)
}

// Toast notification assertions
export const expectToastToBeVisible = (message?: string | RegExp) => {
  const toast = message
    ? screen.getByText(message)
    : screen.getByRole('status')
  expect(toast).toBeInTheDocument()
}

// Pagination assertions
export const expectPaginationToShowPage = (pageNumber: number) => {
  const pageButton = screen.getByRole('button', { name: pageNumber.toString() })
  expect(pageButton).toHaveAttribute('aria-current', 'page')
}

export const expectPaginationToHavePages = (totalPages: number) => {
  for (let i = 1; i <= totalPages; i++) {
    expect(screen.getByRole('button', { name: i.toString() })).toBeInTheDocument()
  }
}