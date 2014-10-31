some tests require the 'fs' module to read jquery and rancho builds
before running tests. Travis CI expects that the tests
will be run from root directory like below
-----------------------------------------------------------------------

``bash
cd /rancho
node test/*js
``

