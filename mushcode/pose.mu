/*
--------------------------------------------------------------------
M_POSE Mogrify function.
--------------------------------------------------------------------
*/
&m_pose #41=
  // Get the JSON listeners in the room. 
  [setq(0,
    iter(
      lcon(loc(%2),listening),
      if(hasflag(##,marker1),##)
    ), json
  )]
  
  // Get the rest of the listeners in the room including the
  // enactor.
  [setq(1,
    setdiff(
      lcon(loc(%2), listening),
      %q0
    ), telnet
  )]
  
  // Save the final message
  [setq(2,%0, message)]
 
  
  [setq(3,execscript(stats.js,%2/misc.avatar), avatar)]
 
 
  // Send the message to the websockets.
  [pemit(%q0,execscript(pose/pose.js))]
  
  // Send ti the telnet crowd
  [pemit(%q1, %0)]

