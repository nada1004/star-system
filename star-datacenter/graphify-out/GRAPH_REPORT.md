# Graph Report - .  (2026-04-18)

## Corpus Check
- 50 files · ~232,985 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1278 nodes · 3492 edges · 28 communities detected
- Extraction: 71% EXTRACTED · 29% INFERRED · 0% AMBIGUOUS · INFERRED: 1020 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Core Data Structures|Core Data Structures]]
- [[_COMMUNITY_Rendering Pipeline|Rendering Pipeline]]
- [[_COMMUNITY_Match & Game Results|Match & Game Results]]
- [[_COMMUNITY_Player Statistics|Player Statistics]]
- [[_COMMUNITY_Tournament Management|Tournament Management]]
- [[_COMMUNITY_Competition Module|Competition Module]]
- [[_COMMUNITY_Paste Parsing System|Paste Parsing System]]
- [[_COMMUNITY_UI Components|UI Components]]
- [[_COMMUNITY_Settings & Configuration|Settings & Configuration]]
- [[_COMMUNITY_Authentication & Access|Authentication & Access]]
- [[_COMMUNITY_File Dependencies|File Dependencies]]
- [[_COMMUNITY_Data Persistence|Data Persistence]]
- [[_COMMUNITY_League Systems|League Systems]]
- [[_COMMUNITY_Event Handling|Event Handling]]
- [[_COMMUNITY_Display & Formatting|Display & Formatting]]
- [[_COMMUNITY_Feature Modules|Feature Modules]]
- [[_COMMUNITY_Cloud Synchronization|Cloud Synchronization]]
- [[_COMMUNITY_Bug Fixes|Bug Fixes]]
- [[_COMMUNITY_Architecture Patterns|Architecture Patterns]]
- [[_COMMUNITY_Tier Rankings|Tier Rankings]]
- [[_COMMUNITY_Modal & UI Patterns|Modal & UI Patterns]]
- [[_COMMUNITY_Script Loading|Script Loading]]
- [[_COMMUNITY_ELO & Stats Engine|ELO & Stats Engine]]
- [[_COMMUNITY_Documentation|Documentation]]
- [[_COMMUNITY_Project Guidance|Project Guidance]]
- [[_COMMUNITY_Code Quality|Code Quality]]
- [[_COMMUNITY_Historical Data|Historical Data]]
- [[_COMMUNITY_System Integration|System Integration]]

## God Nodes (most connected - your core abstractions)
1. `render()` - 272 edges
2. `save()` - 262 edges
3. `_findTourneyById()` - 69 edges
4. `getAllUnivs()` - 45 edges
5. `cm()` - 38 edges
6. `rHist()` - 33 edges
7. `om()` - 33 edges
8. `generateResponse()` - 28 edges
9. `gc()` - 28 edges
10. `injectUnivIcons()` - 24 edges

## Surprising Connections (you probably didn't know these)
- `rotateRandomImage()` --calls--> `_b2UpdateMainDisplay()`  [INFERRED]
  js\settings.js → js\board2.js
- `renameUnivAcrossData()` --calls--> `saveBoardPlayerOrder()`  [INFERRED]
  js\settings.js → js\cloud-board.js
- `setBoardMemo2()` --calls--> `save()`  [INFERRED]
  js\settings.js → js\constants.js
- `setBoardNote()` --calls--> `save()`  [INFERRED]
  js\settings.js → js\constants.js
- `renderGJShareCard()` --calls--> `gc()`  [INFERRED]
  js\match-builder.js → js\constants.js

## Hyperedges (group relationships)
- **Data Flow Pipeline: Parse → Store → Render** — paste_parsing_system, data_storage_localstorage, rendering_pattern_sw_render [EXTRACTED 0.95]
- **Player Stats Lifecycle: Match → ELO Update → Display** — match_data_structure, elo_rating_system, tier_system [INFERRED 0.88]

## Communities

### Community 0 - "Core Data Structures"
Cohesion: 0.02
Nodes (185): refreshSel(), saveGameEdit(), saveB2NewPlayer(), biApply(), calDeleteSched(), calShowDay(), openCalSchedModal(), rCal() (+177 more)

### Community 1 - "Rendering Pipeline"
Cohesion: 0.04
Nodes (103): showToast(), updateFabButtonOnclick(), updateFabVisibility(), addBoardMemoImg(), addBoardNoteImg(), addMap(), addMapAlias(), addPlayer() (+95 more)

### Community 2 - "Match & Game Results"
Cohesion: 0.06
Nodes (100): _bktEditAddGame(), _bktEditRenderGames(), _bktEditSave(), _calcProGrpRank(), _findTourneyById(), getCurrentProTourney(), openBktEditPasteModal(), openPcBktBulkPasteModal() (+92 more)

### Community 3 - "Player Statistics"
Cohesion: 0.04
Nodes (69): escAttr(), getAllUnivs(), histUnivCompHTML(), _buildGalleryView(), bulkApplySearchFilter(), mergePlayers(), mergePlayersApply(), openBulkEditModal() (+61 more)

### Community 4 - "Tournament Management"
Cohesion: 0.08
Nodes (72): _b2AlphaHex(), _b2ApplyImgSettingsToDom(), _b2ApplyImgSettingsToElement(), _b2ApplySettingsToAll(), _b2Avatar(), _b2AvatarFallback(), _b2BuildImageControlGroup(), _b2CenterImage() (+64 more)

### Community 5 - "Competition Module"
Cohesion: 0.05
Nodes (52): buildDetailHTML(), buildSingleSetHTML(), _bulkCountUpdate(), bulkToggleAll(), closeMovePop(), compSummaryListHTML(), _ensureHistDetailModal(), _getCompMatchObj() (+44 more)

### Community 6 - "Paste Parsing System"
Cohesion: 0.04
Nodes (43): saveCfg(), addBoardMemoImg(), addBoardNoteImg(), addMap(), addMapAlias(), _bindCfgHandlers(), _cfgApplyCat(), _cfgEnsureModal() (+35 more)

### Community 7 - "UI Components"
Cohesion: 0.1
Nodes (63): addMessage(), _calcWL_sets(), _calcWL_simple(), chatNavPage(), clearChatHistory(), closeChatbot(), copyChatMessage(), createTrendChart() (+55 more)

### Community 8 - "Settings & Configuration"
Cohesion: 0.06
Nodes (49): recSummaryListHTML(), buildCKInputHTML(), buildProInputHTML(), ckAddBySearch(), ckAddMember(), ckRankHTML(), ckSearchPlayer(), deleteGjGame() (+41 more)

### Community 9 - "Authentication & Access"
Cohesion: 0.08
Nodes (51): saveBoardChipPhotoSettings(), rCompTourDynamic(), addCustomStatusIcon(), applyGameResult(), applyProfileShapeVars(), calcElo(), escJS(), gc() (+43 more)

### Community 10 - "File Dependencies"
Cohesion: 0.11
Nodes (49): saveB2FemcoAllImg(), _saveB2FemcoInternal(), _applyCloudData(), boardCardMove(), boardMovePlayer(), boardTransferPlayer(), boardTransferPlayerFromChip(), _brdAddCustomIcon() (+41 more)

### Community 11 - "Data Persistence"
Cohesion: 0.08
Nodes (39): bktAddGame(), bktAddSet(), bktAddSet2(), bktAddSet3(), bktDelGame(), bktDelSet(), bktRefreshSets(), bktSetGame() (+31 more)

### Community 12 - "League Systems"
Cohesion: 0.08
Nodes (40): _biFind(), _biParseLine(), closePasteModal(), findPlayerByPartialName(), _findSimilarPlayers(), getMapAlias(), insertProMatchSep(), onPasteModeChange() (+32 more)

### Community 13 - "Event Handling"
Cohesion: 0.1
Nodes (38): captureSection(), captureStats(), _imgToDataUrls(), openBktShareCard(), applyUnivLogoVars(), openGJShareCard(), openIndShareCard(), _fabGo() (+30 more)

### Community 14 - "Display & Formatting"
Cohesion: 0.07
Nodes (21): applyLoginState(), deleteAdminAccount(), doLogin(), doLogout(), getAdminAccounts(), getAdminHashes(), initLoginHash(), _rightRotate() (+13 more)

### Community 15 - "Feature Modules"
Cohesion: 0.11
Nodes (23): _gcAnimLoop(), _gcClearHistory(), _gcClearItems(), _gcParseWeightedCSV(), _gcRefreshHistory(), _gcRenderProbBox(), _gcSaveText(), _gcSetup() (+15 more)

### Community 16 - "Cloud Synchronization"
Cohesion: 0.17
Nodes (21): _pbBuild(), _pbChargeLoop(), _pbChargeRelease(), _pbChargeStart(), _pbCleanup(), _pbConfetti(), _pbDraw(), _pbFlipCollide() (+13 more)

### Community 17 - "Bug Fixes"
Cohesion: 0.18
Nodes (17): _drBeginRace(), _drCleanup(), _drClearHistory(), _drDrawBG(), _drGetAC(), _drGetHistory(), _drInit(), _drLoop() (+9 more)

### Community 18 - "Architecture Patterns"
Cohesion: 0.2
Nodes (14): _whAddHistory(), _whDraw(), _whFireConfetti(), _whHistHTML(), _whInit(), _whOnInput(), _whParseWeightedCSV(), _whPlayWin() (+6 more)

### Community 19 - "Tier Rankings"
Cohesion: 0.29
Nodes (2): closeMobileMatchOverlay(), closeMobileMatchSheet()

### Community 20 - "Modal & UI Patterns"
Cohesion: 0.29
Nodes (8): Cloud Board Tab (현황판), Competition Module (Leagues & Tournaments), Match Object Structure, Paste Parsing System, Player Object Structure, search.js, Tier System and Rankings, Tournament Object Structure

### Community 21 - "Script Loading"
Cohesion: 0.48
Nodes (5): _mbGetDefaultMaps(), _mbInit(), _mbOnMapSel(), _mbRenderUI(), _mbSetupCanvas()

### Community 22 - "ELO & Stats Engine"
Cohesion: 0.4
Nodes (5): constants.js, localStorage Data Storage, Star University Data Center, render.js, Rendering Pattern (sw → render → r{})

### Community 23 - "Documentation"
Cohesion: 1.0
Nodes (2): _deliver(), ghPoll()

### Community 24 - "Project Guidance"
Cohesion: 1.0
Nodes (2): populateCrewOptions(), toggleGameFields()

### Community 25 - "Code Quality"
Cohesion: 1.0
Nodes (2): ELO Rating Calculation, Game Result Application (ELO/Stats Updates)

### Community 26 - "Historical Data"
Cohesion: 1.0
Nodes (0): 

### Community 27 - "System Integration"
Cohesion: 1.0
Nodes (1): Script Load Order

## Knowledge Gaps
- **9 isolated node(s):** `Script Load Order`, `constants.js`, `render.js`, `search.js`, `Tier System and Rankings` (+4 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Code Quality`** (2 nodes): `ELO Rating Calculation`, `Game Result Application (ELO/Stats Updates)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Historical Data`** (1 nodes): `app-namespace.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `System Integration`** (1 nodes): `Script Load Order`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `render()` connect `Core Data Structures` to `Rendering Pipeline`, `Match & Game Results`, `Player Statistics`, `Tournament Management`, `Competition Module`, `Paste Parsing System`, `Settings & Configuration`, `File Dependencies`, `Data Persistence`, `Event Handling`, `Display & Formatting`, `Feature Modules`, `Bug Fixes`?**
  _High betweenness centrality (0.355) - this node is a cross-community bridge._
- **Why does `save()` connect `Core Data Structures` to `Rendering Pipeline`, `Match & Game Results`, `Player Statistics`, `Tournament Management`, `Competition Module`, `Paste Parsing System`, `Settings & Configuration`, `Authentication & Access`, `File Dependencies`, `Data Persistence`, `League Systems`, `Display & Formatting`, `Architecture Patterns`?**
  _High betweenness centrality (0.235) - this node is a cross-community bridge._
- **Why does `openPlayerDetail()` connect `UI Components` to `Authentication & Access`, `File Dependencies`?**
  _High betweenness centrality (0.109) - this node is a cross-community bridge._
- **Are the 260 inferred relationships involving `render()` (e.g. with `saveB2Profile()` and `toggleBoardUniv()`) actually correct?**
  _`render()` has 260 INFERRED edges - model-reasoned connections that need verification._
- **Are the 256 inferred relationships involving `save()` (e.g. with `_b2SaveImgSettings()` and `moveCrewCfg()`) actually correct?**
  _`save()` has 256 INFERRED edges - model-reasoned connections that need verification._
- **Are the 2 inferred relationships involving `_findTourneyById()` (e.g. with `_grpPasteApplyLogic()` and `_grpPasteApplyLogic()`) actually correct?**
  _`_findTourneyById()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Are the 43 inferred relationships involving `getAllUnivs()` (e.g. with `_b2VisUnivs()` and `_getBoardUnivs()`) actually correct?**
  _`getAllUnivs()` has 43 INFERRED edges - model-reasoned connections that need verification._