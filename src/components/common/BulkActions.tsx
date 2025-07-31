import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { ChevronDown, Trash2, Edit, Download, Send } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface BulkActionsProps {
  selectedItems: string[]
  onSelectAll: (checked: boolean) => void
  onSelectItem: (id: string, checked: boolean) => void
  totalItems: number
  actions?: {
    label: string
    icon?: any
    variant?: 'default' | 'destructive' | 'outline'
    action: (selectedIds: string[]) => void | Promise<void>
    requiresConfirmation?: boolean
    confirmationTitle?: string
    confirmationDescription?: string
  }[]
}

export function BulkActions({
  selectedItems,
  onSelectAll,
  onSelectItem,
  totalItems,
  actions = []
}: BulkActionsProps) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [pendingAction, setPendingAction] = useState<any>(null)
  const { toast } = useToast()

  const defaultActions = [
    {
      label: 'Delete Selected',
      icon: Trash2,
      variant: 'destructive' as const,
      action: async (selectedIds: string[]) => {
        toast({
          title: 'Items Deleted',
          description: `${selectedIds.length} items have been deleted.`,
        })
      },
      requiresConfirmation: true,
      confirmationTitle: 'Delete Items',
      confirmationDescription: `Are you sure you want to delete ${selectedItems.length} items? This action cannot be undone.`
    },
    {
      label: 'Export Selected',
      icon: Download,
      variant: 'outline' as const,
      action: async (selectedIds: string[]) => {
        toast({
          title: 'Export Started',
          description: `Exporting ${selectedIds.length} items...`,
        })
      }
    }
  ]

  const allActions = [...defaultActions, ...actions]
  const isAllSelected = selectedItems.length === totalItems && totalItems > 0
  const isIndeterminate = selectedItems.length > 0 && selectedItems.length < totalItems

  const handleAction = (action: any) => {
    if (action.requiresConfirmation) {
      setPendingAction(action)
      setIsConfirmOpen(true)
    } else {
      action.action(selectedItems)
    }
  }

  const confirmAction = async () => {
    if (pendingAction) {
      await pendingAction.action(selectedItems)
      setPendingAction(null)
    }
    setIsConfirmOpen(false)
  }

  if (selectedItems.length === 0) {
    return (
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            checked={isAllSelected}
            onCheckedChange={onSelectAll}
          />
          <span className="text-sm text-muted-foreground">
            Select all ({totalItems})
          </span>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            checked={isAllSelected}
            onCheckedChange={onSelectAll}
          />
          <span className="text-sm font-medium">
            {selectedItems.length} of {totalItems} selected
          </span>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              Actions
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {allActions.map((action, index) => (
              <DropdownMenuItem
                key={index}
                onClick={() => handleAction(action)}
                className={action.variant === 'destructive' ? 'text-destructive' : ''}
              >
                {action.icon && <action.icon className="mr-2 h-4 w-4" />}
                {action.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingAction?.confirmationTitle || 'Confirm Action'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingAction?.confirmationDescription || 
               'Are you sure you want to perform this action?'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmAction}
              className={pendingAction?.variant === 'destructive' ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}