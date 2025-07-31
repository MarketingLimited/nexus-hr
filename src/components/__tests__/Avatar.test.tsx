import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test-utils'
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar'

describe('Avatar Components', () => {
  describe('Avatar', () => {
    it('renders with default styling', () => {
      render(
        <Avatar>
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
      )
      
      const avatar = screen.getByText('JD').parentElement
      expect(avatar).toHaveClass('relative', 'flex', 'h-10', 'w-10', 'shrink-0', 'overflow-hidden', 'rounded-full')
    })

    it('applies custom className', () => {
      render(
        <Avatar className="custom-avatar">
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
      )
      
      const avatar = screen.getByText('JD').parentElement
      expect(avatar).toHaveClass('custom-avatar')
    })
  })

  describe('AvatarImage', () => {
    it('renders image with correct attributes', () => {
      render(
        <Avatar>
          <AvatarImage src="/test-image.jpg" alt="Test User" />
          <AvatarFallback>TU</AvatarFallback>
        </Avatar>
      )
      
      const image = screen.getByRole('img', { name: 'Test User' })
      expect(image).toHaveAttribute('src', '/test-image.jpg')
      expect(image).toHaveClass('aspect-square', 'h-full', 'w-full')
    })

    it('applies custom className to image', () => {
      render(
        <Avatar>
          <AvatarImage src="/test.jpg" alt="Test" className="custom-image" />
          <AvatarFallback>T</AvatarFallback>
        </Avatar>
      )
      
      const image = screen.getByRole('img')
      expect(image).toHaveClass('custom-image')
    })
  })

  describe('AvatarFallback', () => {
    it('renders fallback text with correct styling', () => {
      render(
        <Avatar>
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
      )
      
      const fallback = screen.getByText('JD')
      expect(fallback).toHaveClass('flex', 'h-full', 'w-full', 'items-center', 'justify-center', 'rounded-full', 'bg-muted')
    })

    it('applies custom className to fallback', () => {
      render(
        <Avatar>
          <AvatarFallback className="custom-fallback">AB</AvatarFallback>
        </Avatar>
      )
      
      const fallback = screen.getByText('AB')
      expect(fallback).toHaveClass('custom-fallback')
    })
  })

  describe('Complete Avatar Structure', () => {
    it('renders with both image and fallback', () => {
      render(
        <Avatar>
          <AvatarImage src="/user.jpg" alt="User Avatar" />
          <AvatarFallback>UA</AvatarFallback>
        </Avatar>
      )
      
      expect(screen.getByRole('img', { name: 'User Avatar' })).toBeInTheDocument()
      expect(screen.getByText('UA')).toBeInTheDocument()
    })

    it('supports different sizes through className', () => {
      render(
        <Avatar className="h-12 w-12">
          <AvatarFallback>LG</AvatarFallback>
        </Avatar>
      )
      
      const avatar = screen.getByText('LG').parentElement
      expect(avatar).toHaveClass('h-12', 'w-12')
    })
  })
})