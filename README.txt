
Parameters s, a, d, m can be found in the inspect link of a csgo item. 

| Parameter     | Description   |
|:-------------:|:-------------|
| s             | Optional: If an inventory item, fill out this parameter from the inspect URL |
| a             | Required: Inspect URL "a" param      |
| d             | Required: Inspect URL "d" param      |
| m             | Optional: If a market item, fill out this parameter from the inspect URL      |

##### Examples

`https://api.csgofloat.com/?m=563330426657599553&a=6710760926&d=9406593057029549017`

`https://api.csgofloat.com/?s=76561198084749846&a=6777992090&d=3378412659870065794`



### `GET /` (Using an Inspect URL)

| Parameter     | Description   |
|:-------------:|:-------------|
| url             | Required: Inspect URL of the CSGO item |

##### Examples

`https://api.csgofloat.com/?url=steam://rungame/730/76561202255233023/+csgo_econ_action_preview%20S76561198084749846A698323590D7935523998312483177`

`https://api.csgofloat.com/?url=steam://rungame/730/76561202255233023/+csgo_econ_action_preview%20M625254122282020305A6760346663D30614827701953021`