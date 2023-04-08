import { useEffect, useMemo, useState } from 'react'
import { config } from '../env'

interface CacheItem<T> {
  data: T
  timestamp: number
}

interface Cache<T> {
  [key: string]: CacheItem<T>
}

function useCache<T>(key: string): [T | null, (data: T) => void] {
  const [cache, setCache] = useState<Cache<T>>({})

  const { SEARCH_API_CACHE_TTL } = config

  useEffect(() => {
    // clean up expired cache items every CACHE_TTL milliseconds
    const intervalId = setInterval(() => {
      setCache((cache) => {
        const newCache = { ...cache }
        Object.keys(cache).forEach((key) => {
          if (Date.now() - cache[key].timestamp > SEARCH_API_CACHE_TTL) {
            delete newCache[key]
          }
        })
        return newCache
      })
    }, SEARCH_API_CACHE_TTL)

    return () => clearInterval(intervalId)
  }, [])

  const getCachedData = useMemo(() => {
    const cacheItem = cache[key]
    if (cacheItem && Date.now() - cacheItem.timestamp < SEARCH_API_CACHE_TTL) {
      return cacheItem.data
    }
    return null
  }, [cache, key])

  const cacheData = (data: T) => {
    setCache((cache) => ({ ...cache, [key]: { data, timestamp: Date.now() } }))
  }

  return [getCachedData, cacheData]
}

export default useCache
