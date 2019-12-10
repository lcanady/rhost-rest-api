/*
-----------------------------------------------------------------------------
  @connect sends a message after a character connects to tell the JSON
  client that it's okay to start showing messages to the player.  This
  helps skip the hardcoded intro text.
-----------------------------------------------------------------------------
*/
@aconnect JHK = 
  if(
    hasflag(%#,json),
    pemit(%#,
      %{
        "type": "connect"%,
        "newLines" : true
      %}
    )
  )