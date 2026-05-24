## ok so I think this is how it worked

### v2 files from old react-based poggers.ltd with top50 only

1. download `<date>.json` from server to **./archive-old**
   ```json
   [{
     "nam": <...>, ...
   },
   ...]
   ```
2. run `node v2v3.2conv.js` (**./archive-old** -> **./archive-new**)\
   will convert into new json format and insert into database
   `json
    {
      "_id": "<date>",
      "top50": [ {"name": <...>, ...}, ... ]
    }
    `
3. run `node setGainedScores.js` (**./archive-new** -> **./archive-aftergains**)\
   this like reads all files in ./archive-new and sets gains based on that, then updates the db
4. run `node populatePlayers.js`
5. ~~run `node setMostGainedAndPeak.js`~~ populatePlayers takes care of it already
6. run `node setMostGainedRanking.js`
