import glob

files = []
for file in glob.glob('./p/*/metadata.js'):
    fileContents = open(file, 'r').read()

    if 'export default' in fileContents:
        files.append(file)

print("GOT:", ", ".join(files))

with open('./p/metadata.js', 'w') as outfile:
    outfile.write("export default [\n")
    for file in files:
        fileContents = open(file, 'r').read()
        outfile.write(fileContents.replace('export default', '').strip() + ",\n")
    outfile.write("]")