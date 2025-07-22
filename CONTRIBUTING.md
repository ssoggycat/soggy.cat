# contributions of soggeth - go wild
don't though

# NOTICE:
## this is outdated

# Neat guide to keep everything consistent!!
just ask us. either to review what you're cooking or ask us to finish this

# im using these standards right now so follow them too
- i don't have any other consistent ordering for `<head>` but these four are ordered. <br>
	<sub> this is a bit broken because the icon doesn't gonna anywhere but that isn't the focus of this </sub>
	```html
	<meta charset="UTF-8"/>
	<meta name="viewport" content="width=device-width, initial-scale=1"/>

	<title>VOTE NOW</title>
	<link rel="icon" href="/static/ssoggycat/team/images/soggymask.webp"/>
	```

	charset, then viewport, then title, then link<br>
	(no pages currently follow this standard)
- get eslint we have a config
- static is a mess but don't put assets anywhere else except for anything important like stylesheets only used on one page or scripts only used on one page...


# Examples
### An example of good code:
```html
<div id="sidemenu">
	<a href="/github" class="menubuttonsa">
		<div class="menubuttons">
			<img src='/assets/images/code.svg'>
			<p>code</p>
		</div>
	</a>

	<a href="nocss" class="menubuttonsa">
		<div class="menubuttons small">
			<img src='/assets/svgs/nocss.svg'>
			<p>no css</p>
		</div>
	</a>

	<a href="#" class="menubuttonsa"
		onclick="document.getElementById('picker').click(); return false;">
		<div class="menubuttons small">
			<img src='/assets/images/upload.svg'>
			<p>upload</p>
		</div>
	</a>
</div>
```

### An example of bad code:
```html
<body>

<div class="bg-image"></div>

<div class="bg-text">
	<img class="coin" src="https://soggy.cat/stop/assets/earth.png"><br>
	<img class="warn" src="https://soggy.cat/stop/assets/warn.png">
</div>

</body>
```
*[soggy.cat/stop](https://soggy.cat/stop)*
