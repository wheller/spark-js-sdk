---
layout:      example
title:       "Storage Layer"
categories:  example
description: "This guide explains how the storage layer works and how to write your own storage adapter"
---

The storage layer takes care of storing and loading bounded data like user credentials and unbounded data like encryption keys. Note that the storage layer is *not* intended to be your application's database (though may interface with your application's database).

# Usage

Within a spark plugin, the storage layer is available via two properties: `this.boundedStorage` and `this.unboundedStorage`. `boundedStorage` should be used for things with a known size (e.g. user credentials, device registration payloads, etc). `unboundedStorage` should be used for arrays of unknown length (e.g. encryption keys). These properties are bound to the namespace defined by the plugin.

# Adapters

A storage adapter is a prescribed interface to an arbitrary storage backend. Its entry point is `bind()`. Bind accepts one argument, `namespace`, and returns an object containing the methods `del()`, `get()`, and `put()`. These methods are scoped to the `namespace`. For example, the following block would write the value `true` to the key `"proof"` in the `namespace` `"spark-core"`.

```javascript
const binding = adapter.bind(`spark-core`);
binding.put("proof", true)
  .then(() => {
    // true has been written to the key "proof" in the namespace "spark-core"
  });
```

# Existing Adapters

`spark-core` defines `MemoryStoreAdapter` as an all-purpose, in-memory adapter. `@ciscospark/storage-adapter-local-storage` and `@ciscospark/storage-adapter-local-forage` are available for browser clients. (`ciscospark` uses `@ciscospark/storage-adapter-localstorage` for `boundedStorage` by default).

# Writing your own adapter

Because of the near-limitless set of options for NodeJS storage backends, we don't provide any such adapters. We do, however, provide a blackbox test suite, `@ciscospark/storage-adapter-spec`, for proving out new adapters.
