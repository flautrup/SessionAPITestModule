# SessionAPITestModule

## Description
This is a example implementation in Nodejs of how the Session API in the Qlik Sense Proxy can be used.

# Installation
*	Install nodejs found at http://nodejs.org/
*	Download the SessionAPITestModule.zip
*	Unzip SessionAPITestModule
*	From the command prompt go to the directory where you unzipped SessionAPITestModule
*	Run npm install
*	Go to QMC and export certificate for host that SessionAPITestModule is running on with password test
*	Copy certificates from C:\ProgramData\Qlik\Sense\Repository\Exported Certificates\[host] to the directory where you unzipped SessionAPITestModule
*	From the directory where you unzipped AccessControlTestModule run "node AccessControlTestModule.js"
*	Access SessionAPITestModule though your browser on https://[host]:8190/


## Use
When you press login on the page a session token is generated for that user and sent to the proxy to be created. If you press the link
to redirect to the hub you are logged into Qlik Sense using the session.
If you go back to the https://[host]:8190/ you can now request information about the current session or logout the current session.

In a real use case a portal that embed Qlik Sense content could register it's session after the user has been authenticated. Doing this would let
the portal use the portal session to request Qlik Sense content.
	


## Setup
To add or change users edit the SelectUser.htm file.

To add a new user add this section in the table
```
<tr>
            <td><img src="resource/icon" /></td>
			<td>bbr</td>
			<td>Bryan Baker</td>
			<td>Vice President of Sales</td>
			<td><a href="/login?selectedUser=bbr&userDirectory=QVNCYCLES">Login</a> | <a href="/logout?selectedUser=bbr&userDirectory=QVNCYCLES">Logout</a></td>
</tr>
```

First cell defines an icon
Second the user id
Third the users full name
Fourth description of the user in this case Vice President of Sales
Fifth is the link to logging in and out. The parameter selectedUser is the user id (in this case bbr) of the user and userDirectory is the user directory (in this case QVNCYCLES the user belongs to.

Storing the file with the new section will let you log in as the new user.


