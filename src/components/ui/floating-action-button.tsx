import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, Users, Calendar, Shield, Activity, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

const quickAccessActions = [
  {
    label: 'Add Employee',
    icon: Users,
    href: '/employees',
    color: 'bg-blue-500 hover:bg-blue-600'
  },
  {
    label: 'Leave Request',
    icon: Calendar,
    href: '/leave',
    color: 'bg-green-500 hover:bg-green-600'
  },
  {
    label: 'Security Check',
    icon: Shield,
    href: '/security',
    color: 'bg-red-500 hover:bg-red-600'
  },
  {
    label: 'System Status',
    icon: Activity,
    href: '/monitoring',
    color: 'bg-purple-500 hover:bg-purple-600'
  }
]

export const FloatingActionButton = () => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Quick Actions Menu */}
      {isOpen && (
        <Card className="mb-4 shadow-lg">
          <CardContent className="p-2">
            <div className="flex flex-col space-y-2">
              {quickAccessActions.map((action, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  className="justify-start h-10"
                  asChild
                  onClick={() => setIsOpen(false)}
                >
                  <Link to={action.href}>
                    <action.icon className="h-4 w-4 mr-2" />
                    {action.label}
                  </Link>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main FAB */}
      <Button
        size="lg"
        className={cn(
          "h-14 w-14 rounded-full shadow-lg transition-all duration-200",
          isOpen 
            ? "bg-red-500 hover:bg-red-600 rotate-45" 
            : "bg-primary hover:bg-primary/90"
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Plus className="h-6 w-6" />
        )}
      </Button>
    </div>
  )
}