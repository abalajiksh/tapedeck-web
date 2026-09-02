A Hugo shortcode that renders whatever is currently on your deck, on your own
static site. It ships in the Tapedeck repo.

## How it works

The badge is fetched **from the reader's browser** against the one opt-in public
endpoint — `/public/np/<user>`. No token is embedded in your site, and none of
your credentials leave your instance. The endpoint is opt-in: it serves nothing
until you enable it.

## Degradation

It renders nothing at all when the server is unreachable or the deck is empty.
A down instance costs your site a blank space, not a broken widget or a hung
request.
