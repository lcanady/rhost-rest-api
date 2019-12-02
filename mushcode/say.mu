/*
-----------------------------------------------------------------------------
This command replaces the 'say' command to add support for JSON messages 
to the web client.
-----------------------------------------------------------------------------
*/

// Object setup!
@create Globals: JSON Say <JS>
@set JS = inherit indestructible no_modify
@power/arc js = execscript

&cmd.say js=$^say\s(.*)|^"(.*):
  
  // Find the listeners..
  [setq(0, lcon(loc(%#), listening))]
  
  // Find the listeners that are using JSON for communication
  [setq(1, iter(%q0, if(hasflag(##, marker1),##)), JSON)]
  
  // Filter out JSON listeners to see who to send plain text too.
  [setq(2, setdiff(%q0, %q1), TELNET)]
  
  // Set other registers needed by Execscript
  [setq(3, execscript(stats.js, %#/misc.avatar), AVATAR)]
  [setq(4, say, TYPE)]
  [setq(5, [edit("%0","",")], MESSAGE)];
  
  // Message listeners that aren't using JSON.
  @pemit/list %q2 = [cname(%#)] says %q5;
  @pemit/list %q1 = [execscript(pose/pose.js)]; 