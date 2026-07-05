@echo off
echo Committing and pushing all files to GitHub (https://github.com/Karanbir-Singh1/multi-step-loan-app.git)...
git add -A
git commit -m "Initial commit of Multi-Step Loan App"
git branch -M main
git push -u origin main
echo.
echo Process complete. Check your GitHub repository!
pause
