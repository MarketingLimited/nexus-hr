import * as React from "react";
import { useVirtualList } from "@/hooks/useVirtualList";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface VirtualListProps<T> {
  items: T[];
  itemHeight: number;
  height: number;
  className?: string;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;
  onItemClick?: (item: T, index: number) => void;
}

export function VirtualList<T>({
  items,
  itemHeight,
  height,
  className,
  renderItem,
  overscan = 5,
  onItemClick,
}: VirtualListProps<T>) {
  const scrollElementRef = React.useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = React.useState(0);

  const { virtualItems, totalHeight } = useVirtualList(items, {
    itemHeight,
    containerHeight: height,
    overscan,
  });

  const handleScroll = React.useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = event.currentTarget.scrollTop;
    setScrollTop(scrollTop);
  }, []);

  return (
    <div className={cn("relative", className)} style={{ height }}>
      <ScrollArea className="h-full w-full">
        <div
          ref={scrollElementRef}
          className="relative"
          style={{ height: totalHeight }}
          onScroll={handleScroll}
        >
          {virtualItems.map(({ index, start, item }) => (
            <div
              key={index}
              className="absolute top-0 left-0 w-full"
              style={{
                height: itemHeight,
                transform: `translateY(${start}px)`,
              }}
              onClick={() => onItemClick?.(item, index)}
            >
              {renderItem(item, index)}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

// Optimized virtual table component
interface VirtualTableProps<T> {
  items: T[];
  columns: Array<{
    key: string;
    header: string;
    width?: number;
    render?: (item: T) => React.ReactNode;
  }>;
  rowHeight?: number;
  height: number;
  className?: string;
  onRowClick?: (item: T, index: number) => void;
}

export function VirtualTable<T extends Record<string, any>>({
  items,
  columns,
  rowHeight = 50,
  height,
  className,
  onRowClick,
}: VirtualTableProps<T>) {
  const renderRow = React.useCallback(
    (item: T, index: number) => (
      <div
        className={cn(
          "flex items-center border-b border-border px-4",
          "hover:bg-muted/50 cursor-pointer"
        )}
        style={{ height: rowHeight }}
      >
        {columns.map((column) => (
          <div
            key={column.key}
            className="flex-1 truncate"
            style={{ width: column.width }}
          >
            {column.render ? column.render(item) : item[column.key]}
          </div>
        ))}
      </div>
    ),
    [columns, rowHeight]
  );

  return (
    <div className={cn("border rounded-md", className)}>
      {/* Header */}
      <div
        className="flex items-center bg-muted font-medium px-4 border-b"
        style={{ height: rowHeight }}
      >
        {columns.map((column) => (
          <div
            key={column.key}
            className="flex-1 truncate"
            style={{ width: column.width }}
          >
            {column.header}
          </div>
        ))}
      </div>

      {/* Virtual List Body */}
      <VirtualList
        items={items}
        itemHeight={rowHeight}
        height={height - rowHeight}
        renderItem={renderRow}
        onItemClick={onRowClick}
      />
    </div>
  );
}