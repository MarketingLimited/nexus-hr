interface SearchIndex {
  [key: string]: Set<number>;
}

interface IndexedItem {
  id: string;
  [key: string]: any;
}

class SearchIndexService {
  private indices: Map<string, SearchIndex> = new Map();
  private itemsMap: Map<string, IndexedItem[]> = new Map();

  // Create search index for a dataset
  createIndex<T extends IndexedItem>(
    dataType: string,
    items: T[],
    searchableFields: string[]
  ): void {
    const index: SearchIndex = {};
    
    this.itemsMap.set(dataType, items);

    items.forEach((item, itemIndex) => {
      searchableFields.forEach(field => {
        const value = this.getNestedValue(item, field);
        if (value) {
          const tokens = this.tokenize(String(value));
          tokens.forEach(token => {
            if (!index[token]) {
              index[token] = new Set();
            }
            index[token].add(itemIndex);
          });
        }
      });
    });

    this.indices.set(dataType, index);
  }

  // Search with indexed data
  search<T extends IndexedItem>(
    dataType: string,
    query: string,
    options: {
      fuzzy?: boolean;
      maxResults?: number;
      boost?: { [field: string]: number };
    } = {}
  ): T[] {
    const { fuzzy = false, maxResults = 100 } = options;
    const index = this.indices.get(dataType);
    const items = this.itemsMap.get(dataType);

    if (!index || !items) {
      return [];
    }

    const queryTokens = this.tokenize(query.toLowerCase());
    const matchingIndices = new Set<number>();

    queryTokens.forEach(token => {
      // Exact match
      if (index[token]) {
        index[token].forEach(idx => matchingIndices.add(idx));
      }

      // Fuzzy matching if enabled
      if (fuzzy) {
        Object.keys(index).forEach(indexToken => {
          if (this.fuzzyMatch(token, indexToken)) {
            index[indexToken].forEach(idx => matchingIndices.add(idx));
          }
        });
      }
    });

    const results = Array.from(matchingIndices)
      .slice(0, maxResults)
      .map(idx => items[idx] as T);

    return results;
  }

  // Update index when data changes
  updateIndex<T extends IndexedItem>(
    dataType: string,
    updatedItems: T[],
    searchableFields: string[]
  ): void {
    this.createIndex(dataType, updatedItems, searchableFields);
  }

  // Clear specific index
  clearIndex(dataType: string): void {
    this.indices.delete(dataType);
    this.itemsMap.delete(dataType);
  }

  // Clear all indices
  clearAllIndices(): void {
    this.indices.clear();
    this.itemsMap.clear();
  }

  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(token => token.length > 1);
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  private fuzzyMatch(query: string, target: string, threshold = 0.8): boolean {
    if (query === target) return true;
    if (target.includes(query) || query.includes(target)) return true;
    
    const distance = this.levenshteinDistance(query, target);
    const maxLength = Math.max(query.length, target.length);
    const similarity = 1 - (distance / maxLength);
    
    return similarity >= threshold;
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));

    for (let i = 0; i <= str1.length; i++) {
      matrix[0][i] = i;
    }

    for (let j = 0; j <= str2.length; j++) {
      matrix[j][0] = j;
    }

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        );
      }
    }

    return matrix[str2.length][str1.length];
  }
}

export const searchIndexService = new SearchIndexService();