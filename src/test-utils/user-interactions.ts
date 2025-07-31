import { userEvent } from '@testing-library/user-event'
import { screen } from '@testing-library/dom'

// Common user interaction helpers
export const createUser = () => userEvent.setup()

// Form interaction helpers
export const fillForm = async (fields: Record<string, string>) => {
  const user = createUser()
  
  for (const [label, value] of Object.entries(fields)) {
    const field = screen.getByLabelText(new RegExp(label, 'i'))
    await user.clear(field)
    await user.type(field, value)
  }
}

export const submitForm = async (buttonText = /submit|save|create|update/i) => {
  const user = createUser()
  const submitButton = screen.getByRole('button', { name: buttonText })
  await user.click(submitButton)
}

// Navigation helpers
export const clickLink = async (text: string | RegExp) => {
  const user = createUser()
  const link = screen.getByRole('link', { name: text })
  await user.click(link)
}

export const clickButton = async (text: string | RegExp) => {
  const user = createUser()
  const button = screen.getByRole('button', { name: text })
  await user.click(button)
}

// Table interaction helpers
export const sortTable = async (columnHeader: string | RegExp) => {
  const user = createUser()
  const header = screen.getByRole('columnheader', { name: columnHeader })
  await user.click(header)
}

export const selectTableRow = async (rowIndex: number) => {
  const user = createUser()
  const checkboxes = screen.getAllByRole('checkbox')
  if (checkboxes[rowIndex]) {
    await user.click(checkboxes[rowIndex])
  }
}

// Search and filter helpers
export const searchFor = async (searchTerm: string, placeholder = /search/i) => {
  const user = createUser()
  const searchInput = screen.getByPlaceholderText(placeholder)
  await user.clear(searchInput)
  await user.type(searchInput, searchTerm)
}

export const selectFilter = async (filterLabel: string | RegExp, option: string) => {
  const user = createUser()
  const select = screen.getByLabelText(filterLabel)
  await user.click(select)
  const optionElement = screen.getByRole('option', { name: option })
  await user.click(optionElement)
}

// Modal and dialog helpers
export const openModal = async (triggerText: string | RegExp) => {
  const user = createUser()
  const trigger = screen.getByRole('button', { name: triggerText })
  await user.click(trigger)
}

export const closeModal = async () => {
  const user = createUser()
  const closeButton = screen.getByRole('button', { name: /close|cancel|×/i })
  await user.click(closeButton)
}

// Authentication helpers
export const loginUser = async (email = 'john.doe@example.com', password = 'password123') => {
  const user = createUser()
  
  const emailInput = screen.getByLabelText(/email/i)
  const passwordInput = screen.getByLabelText(/password/i)
  const loginButton = screen.getByRole('button', { name: /login|sign in/i })
  
  await user.type(emailInput, email)
  await user.type(passwordInput, password)
  await user.click(loginButton)
}

// Pagination helpers
export const goToNextPage = async () => {
  const user = createUser()
  const nextButton = screen.getByRole('button', { name: /next/i })
  await user.click(nextButton)
}

export const goToPreviousPage = async () => {
  const user = createUser()
  const prevButton = screen.getByRole('button', { name: /previous/i })
  await user.click(prevButton)
}

export const goToPage = async (pageNumber: number) => {
  const user = createUser()
  const pageButton = screen.getByRole('button', { name: pageNumber.toString() })
  await user.click(pageButton)
}

// File upload helpers
export const uploadFile = async (inputLabel: string | RegExp, file: File) => {
  const user = createUser()
  const fileInput = screen.getByLabelText(inputLabel)
  await user.upload(fileInput, file)
}

// Date picker helpers
export const selectDate = async (dateInput: string | RegExp, date: string) => {
  const user = createUser()
  const input = screen.getByLabelText(dateInput)
  await user.clear(input)
  await user.type(input, date)
}

// Tab navigation helpers
export const switchTab = async (tabName: string | RegExp) => {
  const user = createUser()
  const tab = screen.getByRole('tab', { name: tabName })
  await user.click(tab)
}