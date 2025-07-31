import { ChevronRight, Home } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

const routeLabels: Record<string, string> = {
  '/': 'Dashboard',
  '/employees': 'Employees',
  '/attendance': 'Attendance',
  '/leave': 'Leave Management',
  '/payroll': 'Payroll',
  '/performance': 'Performance',
  '/onboarding': 'Onboarding',
  '/reports': 'Reports',
  '/settings': 'Settings',
  '/security': 'Security Management',
  '/workflows': 'Workflow Management',
  '/integration': 'Integration Hub',
  '/monitoring': 'System Monitoring',
  '/documents': 'Documents',
  '/assets': 'Assets'
}

export const NavigationBreadcrumb = () => {
  const location = useLocation()
  const pathSegments = location.pathname.split('/').filter(Boolean)
  
  // Don't show breadcrumbs on dashboard
  if (location.pathname === '/') return null

  return (
    <nav className="flex items-center space-x-1 text-sm text-muted-foreground mb-6">
      <Link 
        to="/" 
        className="flex items-center hover:text-foreground transition-colors"
      >
        <Home className="h-4 w-4" />
      </Link>
      
      {pathSegments.map((_, index) => {
        const path = '/' + pathSegments.slice(0, index + 1).join('/')
        const isLast = index === pathSegments.length - 1
        const label = routeLabels[path] || pathSegments[index]
        
        return (
          <div key={path} className="flex items-center space-x-1">
            <ChevronRight className="h-4 w-4" />
            {isLast ? (
              <span className="font-medium text-foreground">{label}</span>
            ) : (
              <Link 
                to={path}
                className="hover:text-foreground transition-colors"
              >
                {label}
              </Link>
            )}
          </div>
        )
      })}
    </nav>
  )
}