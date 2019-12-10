/*
#############################################################################
  Global Room Parent
#############################################################################

  Basic setup for allowing Json code to co-exist with mush friendly
  formatting.  This code needs to be applied to your global parent room
  to work.  You'll more than likely need to change the dbref I'm uding here.
  
=============================================================================

  Format the description of the room to either show either plain text or
  JSON data for the web client.

-----------------------------------------------------------------------------
*/
&formatdesc #0=
  // get a list of everything visible to the player.
  [if(
    hasflag(%#,json),
    %{
      "enabled": true%, 
      "type": "room"%,
      "exits": "[lexits(%!,|,1)]"%,
      "id": ""%, 
      "img": "[get(%!/img)]"%, 
      "name": "[name(%!)]"%, 
      "desc": "[encode64(%0)]" 
    %}, %0
  )]

/*
-----------------------------------------------------------------------------
  
  @nameformat
  
  If the player has the JSON flag set, hide the name, if not show per
  normal based on flags.

-----------------------------------------------------------------------------
*/

@nameformat #0=
  [if(hasflag(%#,json),,
   if(
      orflags(%#,iWa),
      [cname(%!)]%(%![flags(%!)]%),
      [cname(%!)]
    )
  )]
  
/*
-----------------------------------------------------------------------------
  
  @exitformat
  
  If the player has the JSON flag set, hide the exit list, else show per
  normal.

-----------------------------------------------------------------------------
*/  
@exitformat #0=
  [setq(0,%chObvious Exits:%cn%r[iter(lexits(me), cname(##))]%b)]
  [if(hasflag(%#,json),,%q0)]
  

/*
-----------------------------------------------------------------------------
  
  @conformat
  
  If the player has the JSON flag set, hide the contents, if not show per
  normal based on flags.

-----------------------------------------------------------------------------
*/    
@conformat #0=
  [setq(0,
    %chContents%cn:
    [iter(
      lcon(me, visible),
      if(
        orflags(%#,iWa),
        %r[cname(##)]%(##[flags(##)]%),
        %r[cname(##)]
      )
    )]
  )]
  [if(hasflag(%#,json),,%q0)]