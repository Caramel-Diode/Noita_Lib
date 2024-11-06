interface Iterator<T, TReturn = any, TNext = any> {
    /**
     * Consumes this iterator as non-overlapping subsequences (chunks) of configurable size.
     * @param size chunkSize The size of each chunk.
     * @returns An iterator that yields arrays of elements from the original iterator.
     */
    chunks(size: Number): Iterator<Array<T>, TReturn, TNext>;
}
