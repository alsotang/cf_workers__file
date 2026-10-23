# description

Generate arbitrary size file on [Cloudflare Workers](https://workers.cloudflare.com/).

You can use this service to test your network download speed.

# usage


```bash
wget https://filedownload.alsotang.com/100m
wget https://filedownload.alsotang.com/1g
wget https://filedownload.alsotang.com/500k
```

# limits

* No transfer speed limit, since it is based on Cloudflare Workers worldwide.
* No file size limit. The service use stream to generate file internally.
* Download time should under 30s, otherwise the worker may abort.
